#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <time.h>
#include <windows.h>

#define WIDTH 40
#define HEIGHT 20
#define MAX_LENGTH 100

typedef struct {
    int x, y;
} Point;

typedef struct {
    Point body[MAX_LENGTH];
    int length;
    int direction; // 0=arriba, 1=derecha, 2=abajo, 3=izquierda
} Snake;

Snake snake;
Point food;
int score = 0;
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
    snake.length = 3;
    snake.direction = 1; // Derecha
    
    // Posición inicial de la serpiente
    snake.body[0].x = WIDTH / 2;
    snake.body[0].y = HEIGHT / 2;
    snake.body[1].x = WIDTH / 2 - 1;
    snake.body[1].y = HEIGHT / 2;
    snake.body[2].x = WIDTH / 2 - 2;
    snake.body[2].y = HEIGHT / 2;
    
    // Generar primera comida
    srand(time(NULL));
    food.x = 5 + rand() % (WIDTH - 10);
    food.y = 3 + rand() % (HEIGHT - 6);
    
    hide_cursor();
}

void draw_border() {
    // Bordes horizontales
    for (int x = 0; x < WIDTH + 2; x++) {
        gotoxy(x, 0);
        printf("#");
        gotoxy(x, HEIGHT + 1);
        printf("#");
    }
    
    // Bordes verticales
    for (int y = 0; y < HEIGHT + 2; y++) {
        gotoxy(0, y);
        printf("#");
        gotoxy(WIDTH + 1, y);
        printf("#");
    }
}

void draw_snake() {
    for (int i = 0; i < snake.length; i++) {
        gotoxy(snake.body[i].x + 1, snake.body[i].y + 1);
        if (i == 0) {
            printf("O"); // Cabeza
        } else {
            printf("o"); // Cuerpo
        }
    }
}

void draw_food() {
    gotoxy(food.x + 1, food.y + 1);
    printf("*");
}

void draw_score() {
    gotoxy(0, HEIGHT + 3);
    printf("Puntuación: %d", score);
    gotoxy(0, HEIGHT + 4);
    printf("Controles: W/A/S/D para moverse, Q para salir");
}

void clear_snake_tail() {
    Point tail = snake.body[snake.length - 1];
    gotoxy(tail.x + 1, tail.y + 1);
    printf(" ");
}

void update_snake() {
    // Guardar posición de la cola antes de mover
    Point old_tail = snake.body[snake.length - 1];
    
    // Mover el cuerpo
    for (int i = snake.length - 1; i > 0; i--) {
        snake.body[i] = snake.body[i - 1];
    }
    
    // Mover la cabeza según la dirección
    switch (snake.direction) {
        case 0: snake.body[0].y--; break; // Arriba
        case 1: snake.body[0].x++; break; // Derecha
        case 2: snake.body[0].y++; break; // Abajo
        case 3: snake.body[0].x--; break; // Izquierda
    }
    
    // Verificar colisiones con paredes
    if (snake.body[0].x < 0 || snake.body[0].x >= WIDTH ||
        snake.body[0].y < 0 || snake.body[0].y >= HEIGHT) {
        game_over = 1;
        return;
    }
    
    // Verificar colisiones consigo misma
    for (int i = 1; i < snake.length; i++) {
        if (snake.body[0].x == snake.body[i].x && 
            snake.body[0].y == snake.body[i].y) {
            game_over = 1;
            return;
        }
    }
    
    // Verificar si comió la comida
    if (snake.body[0].x == food.x && snake.body[0].y == food.y) {
        score += 10;
        snake.length++;
        
        // Generar nueva comida
        do {
            food.x = rand() % WIDTH;
            food.y = rand() % HEIGHT;
        } while (food.x == snake.body[0].x && food.y == snake.body[0].y);
    } else {
        // Limpiar la cola solo si no creció
        gotoxy(old_tail.x + 1, old_tail.y + 1);
        printf(" ");
    }
}

void handle_input() {
    if (_kbhit()) {
        char key = _getch();
        switch (key) {
            case 'w':
            case 'W':
                if (snake.direction != 2) snake.direction = 0;
                break;
            case 'd':
            case 'D':
                if (snake.direction != 3) snake.direction = 1;
                break;
            case 's':
            case 'S':
                if (snake.direction != 0) snake.direction = 2;
                break;
            case 'a':
            case 'A':
                if (snake.direction != 1) snake.direction = 3;
                break;
            case 'q':
            case 'Q':
                game_over = 1;
                break;
        }
    }
}

int main() {
    system("title Snake Game - Retro Game IDE");
    
    init_game();
    
    // Dibujar elementos estáticos
    system("cls");
    draw_border();
    
    while (!game_over) {
        draw_snake();
        draw_food();
        draw_score();
        
        handle_input();
        
        // Pequeña pausa
        Sleep(150);
        
        update_snake();
    }
    
    // Pantalla de game over
    gotoxy(WIDTH / 2 - 5, HEIGHT / 2);
    printf("¡GAME OVER!");
    gotoxy(WIDTH / 2 - 8, HEIGHT / 2 + 1);
    printf("Puntuación final: %d", score);
    gotoxy(WIDTH / 2 - 10, HEIGHT / 2 + 2);
    printf("Presiona cualquier tecla...");
    
    _getch();
    return 0;
}
