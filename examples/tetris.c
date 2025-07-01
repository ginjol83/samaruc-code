#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <time.h>
#include <windows.h>

#define WIDTH 12
#define HEIGHT 20
#define PIECE_SIZE 4

// Tipos de piezas Tetris
int pieces[7][4][4] = {
    // I - Línea
    {
        {0,0,0,0},
        {1,1,1,1},
        {0,0,0,0},
        {0,0,0,0}
    },
    // O - Cuadrado
    {
        {0,0,0,0},
        {0,1,1,0},
        {0,1,1,0},
        {0,0,0,0}
    },
    // T - T
    {
        {0,0,0,0},
        {0,1,0,0},
        {1,1,1,0},
        {0,0,0,0}
    },
    // S - S
    {
        {0,0,0,0},
        {0,1,1,0},
        {1,1,0,0},
        {0,0,0,0}
    },
    // Z - Z
    {
        {0,0,0,0},
        {1,1,0,0},
        {0,1,1,0},
        {0,0,0,0}
    },
    // J - J
    {
        {0,0,0,0},
        {1,0,0,0},
        {1,1,1,0},
        {0,0,0,0}
    },
    // L - L
    {
        {0,0,0,0},
        {0,0,1,0},
        {1,1,1,0},
        {0,0,0,0}
    }
};

int board[HEIGHT][WIDTH];
int current_piece[4][4];
int current_x = WIDTH/2 - 2;
int current_y = 0;
int score = 0;
int lines_cleared = 0;
int level = 1;
int game_over = 0;

void gotoxy(int x, int y) {
    COORD coord;
    coord.X = x;
    coord.Y = y;
    SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord);
}

void hide_cursor() {
    CONSOLE_CURSOR_INFO cursor_info;
    GetConsoleCursorInfo(GetStdHandle(STD_OUTPUT_HANDLE), &cursor_info);
    cursor_info.bVisible = FALSE;
    SetConsoleCursorInfo(GetStdHandle(STD_OUTPUT_HANDLE), &cursor_info);
}

void init_game() {
    // Limpiar tablero
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            board[y][x] = 0;
        }
    }
    
    srand(time(NULL));
    hide_cursor();
    
    // Generar primera pieza
    int piece_type = rand() % 7;
    for (int y = 0; y < 4; y++) {
        for (int x = 0; x < 4; x++) {
            current_piece[y][x] = pieces[piece_type][y][x];
        }
    }
}

void draw_board() {
    system("cls");
    
    // Dibujar borde superior
    printf(" ");
    for (int x = 0; x < WIDTH; x++) {
        printf("#");
    }
    printf(" \n");
    
    // Dibujar tablero
    for (int y = 0; y < HEIGHT; y++) {
        printf("#");
        for (int x = 0; x < WIDTH; x++) {
            if (board[y][x]) {
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("#\n");
    }
    
    // Dibujar borde inferior
    printf(" ");
    for (int x = 0; x < WIDTH; x++) {
        printf("#");
    }
    printf(" \n");
    
    // Mostrar información
    printf("Puntuación: %d\n", score);
    printf("Líneas: %d\n", lines_cleared);
    printf("Nivel: %d\n", level);
    printf("\nControles:\n");
    printf("A/D - Mover\n");
    printf("S - Bajar rápido\n");
    printf("W - Rotar\n");
    printf("Q - Salir\n");
}

void draw_piece() {
    for (int y = 0; y < 4; y++) {
        for (int x = 0; x < 4; x++) {
            if (current_piece[y][x]) {
                int screen_x = current_x + x + 1;
                int screen_y = current_y + y + 1;
                if (screen_x > 0 && screen_x <= WIDTH && 
                    screen_y > 0 && screen_y <= HEIGHT) {
                    gotoxy(screen_x, screen_y);
                    printf("@");
                }
            }
        }
    }
}

int check_collision(int piece[4][4], int x, int y) {
    for (int py = 0; py < 4; py++) {
        for (int px = 0; px < 4; px++) {
            if (piece[py][px]) {
                int board_x = x + px;
                int board_y = y + py;
                
                // Verificar límites
                if (board_x < 0 || board_x >= WIDTH || 
                    board_y >= HEIGHT) {
                    return 1;
                }
                
                // Verificar colisión con otras piezas
                if (board_y >= 0 && board[board_y][board_x]) {
                    return 1;
                }
            }
        }
    }
    return 0;
}

void lock_piece() {
    for (int y = 0; y < 4; y++) {
        for (int x = 0; x < 4; x++) {
            if (current_piece[y][x]) {
                int board_x = current_x + x;
                int board_y = current_y + y;
                if (board_y >= 0) {
                    board[board_y][board_x] = 1;
                }
            }
        }
    }
}

void clear_lines() {
    int lines_to_clear[HEIGHT];
    int clear_count = 0;
    
    // Encontrar líneas completas
    for (int y = 0; y < HEIGHT; y++) {
        int full = 1;
        for (int x = 0; x < WIDTH; x++) {
            if (!board[y][x]) {
                full = 0;
                break;
            }
        }
        if (full) {
            lines_to_clear[clear_count++] = y;
        }
    }
    
    // Limpiar líneas
    for (int i = 0; i < clear_count; i++) {
        int line = lines_to_clear[i];
        
        // Mover líneas hacia abajo
        for (int y = line; y > 0; y--) {
            for (int x = 0; x < WIDTH; x++) {
                board[y][x] = board[y-1][x];
            }
        }
        
        // Limpiar línea superior
        for (int x = 0; x < WIDTH; x++) {
            board[0][x] = 0;
        }
        
        // Ajustar índices de líneas posteriores
        for (int j = i + 1; j < clear_count; j++) {
            if (lines_to_clear[j] < line) {
                lines_to_clear[j]++;
            }
        }
    }
    
    // Actualizar puntuación
    if (clear_count > 0) {
        lines_cleared += clear_count;
        score += clear_count * clear_count * 100 * level;
        level = 1 + lines_cleared / 10;
    }
}

void rotate_piece(int piece[4][4]) {
    int temp[4][4];
    
    // Copiar pieza actual
    for (int y = 0; y < 4; y++) {
        for (int x = 0; x < 4; x++) {
            temp[y][x] = piece[y][x];
        }
    }
    
    // Rotar 90 grados
    for (int y = 0; y < 4; y++) {
        for (int x = 0; x < 4; x++) {
            piece[y][x] = temp[3-x][y];
        }
    }
}

void spawn_new_piece() {
    current_x = WIDTH/2 - 2;
    current_y = 0;
    
    int piece_type = rand() % 7;
    for (int y = 0; y < 4; y++) {
        for (int x = 0; x < 4; x++) {
            current_piece[y][x] = pieces[piece_type][y][x];
        }
    }
    
    // Verificar game over
    if (check_collision(current_piece, current_x, current_y)) {
        game_over = 1;
    }
}

void handle_input() {
    if (_kbhit()) {
        char key = _getch();
        int temp_piece[4][4];
        
        switch (key) {
            case 'a':
            case 'A':
                if (!check_collision(current_piece, current_x - 1, current_y)) {
                    current_x--;
                }
                break;
                
            case 'd':
            case 'D':
                if (!check_collision(current_piece, current_x + 1, current_y)) {
                    current_x++;
                }
                break;
                
            case 's':
            case 'S':
                if (!check_collision(current_piece, current_x, current_y + 1)) {
                    current_y++;
                    score += 1;
                }
                break;
                
            case 'w':
            case 'W':
                // Copiar pieza para probar rotación
                for (int y = 0; y < 4; y++) {
                    for (int x = 0; x < 4; x++) {
                        temp_piece[y][x] = current_piece[y][x];
                    }
                }
                rotate_piece(temp_piece);
                
                if (!check_collision(temp_piece, current_x, current_y)) {
                    for (int y = 0; y < 4; y++) {
                        for (int x = 0; x < 4; x++) {
                            current_piece[y][x] = temp_piece[y][x];
                        }
                    }
                }
                break;
                
            case 'q':
            case 'Q':
                game_over = 1;
                break;
        }
    }
}

int main() {
    system("title Tetris - Retro Game IDE");
    
    init_game();
    spawn_new_piece();
    
    int drop_timer = 0;
    int drop_speed = 50 - level * 5;
    
    while (!game_over) {
        draw_board();
        draw_piece();
        
        handle_input();
        
        // Caída automática
        drop_timer++;
        if (drop_timer >= drop_speed) {
            if (!check_collision(current_piece, current_x, current_y + 1)) {
                current_y++;
            } else {
                lock_piece();
                clear_lines();
                spawn_new_piece();
            }
            drop_timer = 0;
            drop_speed = 50 - level * 5;
            if (drop_speed < 5) drop_speed = 5;
        }
        
        Sleep(50);
    }
    
    // Pantalla de game over
    gotoxy(WIDTH/2 - 3, HEIGHT/2 + 2);
    printf("GAME OVER!");
    gotoxy(WIDTH/2 - 5, HEIGHT/2 + 3);
    printf("Puntuación: %d", score);
    gotoxy(WIDTH/2 - 8, HEIGHT/2 + 4);
    printf("Presiona cualquier tecla...");
    
    _getch();
    return 0;
}
