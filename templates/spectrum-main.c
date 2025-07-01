/*
 * ZX Spectrum Program Template
 * Created with Samaruc Code 🐟
 * 
 * Target: ZX Spectrum 48K/128K
 * Compiler: SDCC
 * Architecture: Z80
 */

#include <stdio.h>
#include <string.h>

// ZX Spectrum screen dimensions
#define SCREEN_WIDTH  32
#define SCREEN_HEIGHT 24

// ZX Spectrum memory locations
#define SCREEN_ADDR   0x4000
#define ATTR_ADDR     0x5800

// Colors (BRIGHT + FLASH + PAPER + INK)
#define BLACK         0
#define BLUE          1
#define RED           2
#define MAGENTA       3
#define GREEN         4
#define CYAN          5
#define YELLOW        6
#define WHITE         7

// Simple function to set screen attribute
void set_attr(int x, int y, int color) {
    unsigned char *attr = (unsigned char *)(ATTR_ADDR + y * 32 + x);
    *attr = color;
}

// Plot a pixel on ZX Spectrum screen
void plot_pixel(int x, int y) {
    if (x < 0 || x >= 256 || y < 0 || y >= 192) return;
    
    unsigned char *screen = (unsigned char *)SCREEN_ADDR;
    int offset = (y >> 3) * 32 + (x >> 3) + ((y & 7) << 8);
    unsigned char bit = 1 << (7 - (x & 7));
    
    screen[offset] |= bit;
}

int main() {
    // Clear screen (fill with spaces)
    printf("\x0C"); // Form feed - clears screen
    
    // Print welcome message
    printf("Hola desde ZX Spectrum!\n");
    printf("Creado con Samaruc Code\n\n");
    
    // Set some colors
    for (int i = 0; i < 32; i++) {
        set_attr(i, 10, WHITE | (BLUE << 3)); // White on blue
    }
    
    // Draw a simple pattern
    for (int x = 64; x < 192; x += 4) {
        for (int y = 64; y < 128; y += 4) {
            plot_pixel(x, y);
        }
    }
    
    printf("\n\nPresiona cualquier tecla...");
    getchar();
    
    return 0;
}

/*
 * Compilation instructions:
 * 
 * sdcc -mz80 --no-std-crt0 --opt-code-size main.c
 * 
 * For advanced projects, you might want to use:
 * z88dk-zcc +zx -vn -SO3 -clib=sdcc_iy --max-allocs-per-node200000 main.c -o spectrum_game
 * 
 * Como el samaruc nada en las aguas de Valencia,
 * que tu código fluya suavemente en la memoria del Spectrum! 🐟
 */
