# Movie Management System

This folder contains the current movies showing at Thangam Cinemas.

## Folder Structure

Each movie should have its own folder (Movie1, Movie2, etc.) with the following files:

### Required Files:
- **poster image**: Any image file (jpg, jpeg, png, webp, gif) - if no poster image is found, the movie won't be displayed
- **title.txt**: Contains the movie title
- **info.txt**: Contains movie details and show timings

### Example Structure:
```
assets/movies/
├── Movie1/
│   ├── Idly Kadai.jpg (or poster.jpg, poster.png, etc.)
│   ├── title.txt
│   └── info.txt
├── Movie2/
│   ├── poster.jpg
│   ├── title.txt
│   └── info.txt
```

## How It Works:

1. **Automatic Detection**: The system automatically scans Movie1, Movie2, Movie3, Movie4 folders
2. **Poster Check**: Only movies with poster images are displayed
3. **Show Timings**: The system extracts show times from info.txt (format: "9:00AM, 2:00 PM, 6:00 PM")
4. **Dynamic Display**: If multiple movies have posters, they rotate automatically
5. **Single Screen**: Perfect for one screen that occasionally shows two movies

## Adding a New Movie:

1. Create a new folder (Movie1, Movie2, etc.)
2. Add poster image (any common image format)
3. Create title.txt with movie name
4. Create info.txt with details and show timings
5. The website will automatically detect and display it!

## Show Timings Format:

In info.txt, include timings like:
```
Now Playing | Tamil | 9:00AM, 2:00 PM, 6:00 PM, 10:30 PM
```

The system will automatically extract and display: "Show times: 9:00AM, 2:00 PM, 6:00 PM, 10:30 PM"