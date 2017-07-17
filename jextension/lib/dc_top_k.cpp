#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <algorithm>
#include "mpi.h"

using namespace std;

#define MAXLEN 8192
#define MASTER 0
//#define DEBUG

/**
 * Get line number of a file
 */
unsigned long get_line_number(const char *filename){
    unsigned long line_num = 0;
    FILE *fd;
    if((fd = fopen(filename, "r+")) == NULL){
        fprintf(stderr, "can not open file %s\n", filename);
        exit(-1);
    }
    char buffer[MAXLEN];
    while(fgets(buffer, MAXLEN, fd) != NULL){
        if(buffer[strlen(buffer) - 1] == '\n')
            ++line_num;
    }
    return line_num;
}

/**
 * Get offsets of each section
  */
void get_offsets(const char *filename, unsigned int **offsets, int n, int k){
	FILE *fd;
	if((fd = fopen(filename, "r+")) == NULL){
		fprintf(stderr, "can not open file %s\n", filename);
		exit(-1);
	}
	char buffer[MAXLEN];
	int section_size = n / k;
	n -= n % k;
	int index = 1;
	(*offsets)[0] = 0;
	while(fgets(buffer, MAXLEN, fd) != NULL){
		if(buffer[strlen(buffer) - 1] == '\n')
			--n;
		if(n % section_size == 0)
			(*offsets)[index++] = ftell(fd);
	}
	fseek(fd, 0, SEEK_END);
	(*offsets)[k] = ftell(fd);
}

//for debugging
void print_offsets(unsigned int *offsets, int k){
	int i;
	for(i = 0; i < k; ++i)
		printf("offsets[%d]: %d\n", i, offsets[i]);
	printf("offsets[%d](SEEK_END): %d\n", k, SEEK_END);
}

/**
 * Get a element of a csv line
 */
float get_element(char *line, int col){
	char *pch;
	int cnt = 0;
	pch = strtok(line, ",");
	while(pch != NULL){
		if(cnt++ == col)
			break;
		pch = strtok(NULL, ",");
	}
	if(pch == NULL) return -1;
	return atof(pch);
}

/**
 * Get lines from offset 'offset'
 */
void get_elements(const char *filename, unsigned int offset, int line_cnt, float **eles, int col){
	FILE *fd;
	int i;
	if((fd = fopen(filename, "r+")) == NULL){
		fprintf(stderr, "can not open file %s\n", filename);
		exit(-1);
	}
	char buffer[MAXLEN];
	fseek(fd, offset, SEEK_SET);
	for(i = 0; i < line_cnt; ++i){
		if(fgets(buffer, MAXLEN, fd) != NULL)
			(*eles)[i] = get_element(buffer, col);
	}
}

/**
 * Get max element of a given section in an array
 */
float get_max(float *buf, int beg, int end){
	float ret = buf[beg];
	int i;
	for(i = beg + 1; i < end; ++i)
		ret = ret > buf[i] ? ret : buf[i];
	return ret;
}

bool less_cmp(float a, float b){
	return a < b;
}

bool large_cmp(float a, float b){
	return a > b;
}

int main(int argc, char **argv){
	int proc_num;
	int myrank;
	char *filename;
	unsigned int k;
	unsigned int n;
	unsigned int col;
	unsigned int local_k; //number of groups allocated on a node
	unsigned int *offsets; //accurate file pointer at each section
	unsigned int group_size; //number of elements in a group
	float **eles; //pointers of elements of a node
	float *local_eles; //elements of a node
	float local_min;
	float global_min;
	int total_cnt = 0; //total number of elements that are larger than global minimum element
	int *node_cnts; //number of elements that are larger than global minimum element on each node
	int *disps;
	float *total_eles; //total elements of all the nodes
	unsigned int i;

	MPI_Init(&argc, &argv);
	MPI_Comm_size(MPI_COMM_WORLD, &proc_num);
	MPI_Comm_rank(MPI_COMM_WORLD, &myrank);

	node_cnts = (int *)malloc(proc_num * sizeof(int));
	disps = (int *)malloc(proc_num * sizeof(int));

	if(argc != 4){
		if(myrank == MASTER)
			fprintf(stderr, "usage: mpirun -np <proc_num> ./dc_top_k <filename> <col> <k>\n");
		exit(0);
	}
	
	filename = argv[1];
	col = atoi(argv[2]);
	k = atoi(argv[3]);
	offsets = (unsigned int *)malloc((k + 1) * sizeof(unsigned int));
	if(myrank == MASTER){
		n = get_line_number(filename);
		group_size = n / k;
		get_offsets(filename, &offsets, n, k);
	#ifdef DEBUG
		print_offsets(offsets, k);
		exit(-1);
	#endif
	}
	MPI_Bcast(&n, 1, MPI_INT, MASTER, MPI_COMM_WORLD);
	MPI_Bcast(&group_size, 1, MPI_INT, MASTER, MPI_COMM_WORLD);
	MPI_Bcast(offsets, k, MPI_INT, MASTER, MPI_COMM_WORLD);

	local_k = k / proc_num;
	eles = (float **)malloc(local_k * sizeof(float *));
	local_eles = (float *)malloc(local_k * group_size * sizeof(float));
	for(i = 0; i < local_k; ++i) eles[i] = (float *)&(local_eles[i * group_size]);
	
	//get minimum element of maximum elements
	for(i = 0; i < local_k; ++i){
		int tmp_offset = offsets[myrank * local_k + i];
		get_elements(filename, tmp_offset, group_size, &eles[i], col);
		float tmp_max = get_max(eles[i], 0, group_size);
		if(i == 0) local_min = tmp_max;
		else local_min = local_min < tmp_max ? local_min : tmp_max;
	}
	MPI_Reduce(&local_min, &global_min, 1, MPI_FLOAT, MPI_MIN, 0, MPI_COMM_WORLD);
	MPI_Bcast(&global_min, 1, MPI_FLOAT, MASTER, MPI_COMM_WORLD);
	if(myrank == MASTER) printf("rank[MASTER] global min: %f\n", global_min);

	//get elements larger than global minimum element
	float *node_eles = (float *)&(local_eles[0]);
	int node_cnt = 0; //number of elements that larger than global minmum element
	printf("rank[%d] local_k: %d, group_size: %d, production: %d\n", myrank, local_k, group_size, local_k * group_size);
	for(i = 0; i < local_k * group_size; ++i){
		if(node_eles[i] >= global_min) 
			node_eles[node_cnt++] = node_eles[i];
	}
	printf("rank[%d] node_cnt: %d\n", myrank, node_cnt);
	MPI_Reduce(&node_cnt, &total_cnt, 1, MPI_INT, MPI_SUM, 0, MPI_COMM_WORLD);
	total_eles = (float *)malloc(total_cnt * sizeof(float));
	//gather node_cnts and node_eles of each node on master node
	if(myrank == MASTER) printf("rank[MASTER] total_cnt: %d\n", total_cnt);
	MPI_Gather(&node_cnt, 1, MPI_INT, node_cnts, 1, MPI_INT, MASTER, MPI_COMM_WORLD);
	if(myrank == MASTER){
		for(i = 0; i < (unsigned int)proc_num; ++i){
			if(i == 0){
				disps[i] = 0;
				continue;
			}
			disps[i] = disps[i - 1] + node_cnts[i - 1];
		}
	}
	MPI_Gatherv(node_eles, node_cnt, MPI_FLOAT, total_eles, node_cnts, disps, MPI_FLOAT, 0, MPI_COMM_WORLD);
	if(myrank == MASTER){
		//partial quick sort total_eles to get the top k elements
		printf("total cnt: %d\n", total_cnt);
		sort(total_eles, total_eles + total_cnt, large_cmp);
		for(i = 0; i < k; ++i)
			printf("rank[%d] total_eles[%d] = %f\n", myrank, i, total_eles[i]);
	}
	MPI_Finalize();
	return 0;
}
