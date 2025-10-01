# Movie Management Instructions

## Folder Structure
```
assets/movies/
├── screen1/
│   ├── poster.jpg (main movie poster)
│   ├── title.txt (movie title)
│   └── info.txt (movie details)
└── screen2/
    ├── poster.jpg (main movie poster)
    ├── title.txt (movie title)
    └── info.txt (movie details)
```

## How to Update Movies

### For Screen 1:
1. Add movie poster as `poster.jpg` in `assets/movies/screen1/`
2. Create `title.txt` with the movie title
3. Create `info.txt` with movie details (timing, language, etc.)

### For Screen 2:
1. Add movie poster as `poster.jpg` in `assets/movies/screen2/`
2. Create `title.txt` with the movie title  
3. Create `info.txt` with movie details

### Single Screen Mode:
- If only Screen 1 has files, the slider will show only that movie
- If both screens have files, it will alternate between both
- The system automatically detects available screens

## File Formats:
- **Poster**: JPG, PNG, WebP (recommended: 400x600px)
- **Title**: Plain text file with movie name
- **Info**: Plain text with details like "Now Playing | Tamil | 2:30 PM, 6:00 PM, 9:30 PM"