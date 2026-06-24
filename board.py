import pygame

CELL_SIZE = 40
BOARD_WIDTH = 8
BOARD_HEIGHT = 8

COLORS = {
    'grid': (200, 200, 200),
    'background': (0, 0, 0)
}


def draw_board(surface, board):
    """Draw board contents without overdraw of empty cells."""
    for row_idx, row in enumerate(board):
        for col_idx, cell in enumerate(row):
            if cell is None:
                continue
            rect = pygame.Rect(
                col_idx * CELL_SIZE,
                row_idx * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE,
            )
            surface.fill(cell, rect)


def draw_grid(surface):
    """Draw grid lines over the board."""
    width = BOARD_WIDTH * CELL_SIZE
    height = BOARD_HEIGHT * CELL_SIZE
    for x in range(0, width + 1, CELL_SIZE):
        pygame.draw.line(surface, COLORS['grid'], (x, 0), (x, height))
    for y in range(0, height + 1, CELL_SIZE):
        pygame.draw.line(surface, COLORS['grid'], (0, y), (width, y))


def render(surface, board):
    draw_board(surface, board)
    draw_grid(surface)
