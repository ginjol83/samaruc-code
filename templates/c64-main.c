/*
 * Commodore 64 Program Template  
 * Created with Samaruc Code 🐟
 *
 * Target: Commodore 64
 * Compiler: CC65
 * Architecture: 6502
 */

#include <stdio.h>
#include <conio.h>
#include <string.h>
#include <c64.h>

// C64 screen dimensions
#define SCREEN_WIDTH  40
#define SCREEN_HEIGHT 25

// C64 colors
#define COLOR_BLACK     0
#define COLOR_WHITE     1
#define COLOR_RED       2
#define COLOR_CYAN      3
#define COLOR_PURPLE    4
#define COLOR_GREEN     5
#define COLOR_BLUE      6
#define COLOR_YELLOW    7
#define COLOR_ORANGE    8
#define COLOR_BROWN     9
#define COLOR_LIGHTRED  10
#define COLOR_GRAY1     11
#define COLOR_GRAY2     12
#define COLOR_LIGHTGREEN 13
#define COLOR_LIGHTBLUE 14
#define COLOR_GRAY3     15

// Memory locations
#define SCREEN_RAM      0x0400
#define COLOR_RAM       0xD800
#define BORDER_COLOR    0xD020
#define BACKGROUND_COLOR 0xD021

void setup_screen() {
    // Set border and background colors
    *(unsigned char*)BORDER_COLOR = COLOR_CYAN;
    *(unsigned char*)BACKGROUND_COLOR = COLOR_BLUE;
    
    // Clear screen with custom character
    clrscr();
    textcolor(COLOR_WHITE);
}

void draw_box(int x, int y, int width, int height) {
    int i, j;
    
    for (i = 0; i < height; i++) {
        gotoxy(x, y + i);
        for (j = 0; j < width; j++) {
            if (i == 0 || i == height - 1) {
                cputc('-'); // Top/bottom border
            } else if (j == 0 || j == width - 1) {
                cputc('|'); // Side borders
            } else {
                cputc(' '); // Interior
            }
        }
    }
}

int main() {
    setup_screen();
    
    // Title
    gotoxy(8, 2);
    textcolor(COLOR_YELLOW);
    cprintf("COMMODORE 64 - SAMARUC CODE");
    
    // Welcome message
    gotoxy(2, 5);
    textcolor(COLOR_LIGHTGREEN);
    cprintf("Hola desde Commodore 64!");
    
    gotoxy(2, 6);
    textcolor(COLOR_WHITE);
    cprintf("Creado con Samaruc Code");
    
    // Draw decorative box
    textcolor(COLOR_CYAN);
    draw_box(10, 10, 20, 8);
    
    // Content inside box
    gotoxy(12, 12);
    textcolor(COLOR_YELLOW);
    cprintf("RETRO PROGRAMMING");
    
    gotoxy(15, 14);
    textcolor(COLOR_LIGHTRED);
    cprintf("ON C64!");
    
    gotoxy(13, 16);
    textcolor(COLOR_LIGHTBLUE);
    cprintf("Como el samaruc");
    gotoxy(16, 17);
    cprintf("en el agua");
    
    // Wait for keypress
    gotoxy(2, 22);
    textcolor(COLOR_WHITE);
    cprintf("Presiona cualquier tecla para continuar...");
    
    cgetc(); // Wait for key
    
    return 0;
}

/*
 * Compilation instructions:
 *
 * cl65 -t c64 -O main.c -o c64_program.prg
 *
 * Or with cc65 toolchain:
 * cc65 -t c64 main.c
 * ca65 main.s
 * ld65 -t c64 -o c64_program.prg main.o c64.lib
 *
 * Load in VICE emulator or transfer to real C64:
 * LOAD "C64_PROGRAM.PRG",8,1
 * RUN
 *
 * ¡Que tu código fluya como el samaruc por los 64KB de RAM! 🐟
 */
