#!/bin/sh
# the cart TV's late movie as a small copy of our own: 160x120, 12 fps, mono, two parts under the website's 25 MB a file (usage: sh tools/sushi-film.sh <the film.mp4>)
set -e
IN="$1"; OUT=data/sushi/film; mkdir -p "$OUT"
LEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN"); HALF=$(python3 -c "print(round($LEN/2,1))")
for i in 1 2; do
  if [ $i = 1 ]; then R="-t $HALF"; else R="-ss $HALF"; fi
  ffmpeg -v error -y $R -i "$IN" -vf "scale=160:120:force_original_aspect_ratio=decrease,pad=160:120:(ow-iw)/2:(oh-ih)/2,fps=12" \
    -c:v libx264 -profile:v baseline -preset veryslow -crf 30 -maxrate 60k -bufsize 120k -g 48 \
    -c:a aac -ac 1 -ar 22050 -b:a 24k -movflags +faststart "$OUT/notld-$i.mp4"
done
ls -la "$OUT"
