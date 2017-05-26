#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXLEN 10000

unsigned long get_line_number(const char *filename){
	unsigned long line_num = 0;
	FILE *fd;
	if((fd = fopen(filename, "r+")) == NULL){
		fprintf(stderr, "can not open file %s\n", filename);
		exit(-1);
	}
	char buffer[10000];
	while(fgets(buffer, MAXLEN, fd) != NULL){
		if(buffer[strlen(buffer) - 1] == '\n')
			++line_num;
	}
	return line_num;
}
