#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <time.h>

void concatenate_videos(const char *input_videos[], int num_videos, const char *output_filename) {
    char cmd[1024];
    char concat_list[4096] = "";
    
    // Create a temporary file to hold the list of videos to concatenate
    FILE *list_file = fopen("list.txt", "w");
    if (!list_file) {
        fprintf(stderr, "Error creating list file\n");
        exit(1);
    }

    // Write the list of videos to the temporary file
    for (int i = 0; i < num_videos; i++) {
        fprintf(list_file, "file '%s'\n", input_videos[i]);
    }
    fclose(list_file);

    // Concatenate the videos using FFmpeg
    sprintf(cmd, "ffmpeg -y -f concat -safe 0 -i list.txt -c copy \"%s\"", output_filename);
    system(cmd);

    // Delete the temporary file
    remove("list.txt");
}

void create_video(const char *folder, int number) {
    char *videos_selectionnees[number + 2]; // +2 for intro and outro videos
    int num_videos = 0;

    // Intro video
    char intro_path[1024];
    sprintf(intro_path, "%s/const/intro.mp4", folder);
    videos_selectionnees[num_videos++] = strdup(intro_path);

    // Randomly select 'number' videos
    srand(time(NULL)); // Seed the random number generator
    DIR *dir;
    struct dirent *ent;

    if ((dir = opendir(folder)) != NULL) {
        // Count the total number of videos in the folder
        int total_videos = 0;
        while ((ent = readdir(dir)) != NULL) {
            if (strcmp(ent->d_name, ".") != 0 && strcmp(ent->d_name, "..") != 0) {
                total_videos++;
            }
        }
        closedir(dir);

        // Generate random indices for selecting videos
        int selected_indices[number];
        for (int i = 0; i < number; i++) {
            selected_indices[i] = rand() % total_videos;
        }

        // Open the directory again to select videos using the generated indices
        dir = opendir(folder);
        int current_index = 0;
        while ((ent = readdir(dir)) != NULL) {
            if (strcmp(ent->d_name, ".") != 0 && strcmp(ent->d_name, "..") != 0) {
                if (current_index == selected_indices[num_videos]) {
                    char video_path[1024];
                    sprintf(video_path, "%s/%s", folder, ent->d_name);
                    videos_selectionnees[num_videos++] = strdup(video_path);
                }
                current_index++;
            }
        }
        closedir(dir);
    } else {
        fprintf(stderr, "Error opening directory\n");
        exit(1);
    }

    // Outro video
    char outro_path[1024];
    sprintf(outro_path, "%s/const/outro.mp4", folder);
    videos_selectionnees[num_videos++] = strdup(outro_path);

    // Concatenate videos
    concatenate_videos(videos_selectionnees, num_videos, "outputs/output.mp4");

    // Free allocated memory
    for (int i = 0; i < num_videos; i++) {
        free(videos_selectionnees[i]);
    }
}

int main(int argc, char *argv[]) {
    if (argc < 3) {
        fprintf(stderr, "Pas assez d'arguments.\n");
        return 1;
    }

    const char *folder = argv[1];
    int number = atoi(argv[2]);

    create_video(folder, number);

    return 0;
}
