"""
This script is used to search for a term in a set of subtitle files.
Useful if you want to find a specific scene in a movie or TV show.
"""

import datetime
import re
from argparse import ArgumentParser

import srt
from fuzzysearch import find_near_matches


def search_subtitles(subtitle_files, search_term, d=1):
    first = True
    for subtitle_file in subtitle_files:
        with open(subtitle_file, "r") as f:
            segments = list(srt.parse(f))

        timestamps = []
        content_all = []
        l = 0
        for s in segments:
            c = s.content.replace("\n", " ").strip()
            c = re.sub(r"<.*?>|\{.*?\}", "", c)
            content_all.append(c)
            timestamps.append(
                (
                    l,
                    l + len(c),
                    datetime.timedelta(seconds=s.start.seconds),
                    datetime.timedelta(seconds=s.end.seconds),
                )
            )
            l += len(c) + 1

        def find_timestamp(i):
            for start, end, start_time, end_time in timestamps:
                if start <= i <= end:
                    return start_time, end_time
            raise ValueError(f"Could not find timestamp for index {i}")

        content_all = " ".join(content_all)
        content_all_lower = content_all.lower()

        matches = find_near_matches(search_term.lower(), content_all_lower, max_l_dist=d)

        if matches:
            if not first:
                print()

            print(f"Found \033[91m{len(matches)}\033[0;0m match(es) in \033[97m`{subtitle_file}`\033[0;0m:")
            for match in matches:
                first = False
                before = content_all[max(0, match.start - 30) : match.start]
                after = content_all[match.end : min(len(content_all), match.end + 30)]
                target = content_all[match.start : match.end]

                start_time = find_timestamp(match.start)[0]
                end_time = find_timestamp(match.end - 1)[1]

                print(f">> \033[93m[{start_time} -> {end_time}]\033[0;0m {before}\033[92;1;4m{target}\033[0;0m{after}")


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("subtitles", nargs="+", type=str, help="Path to the subtitle files")
    parser.add_argument("-s", "--search", required=True, type=str, help="The search term")
    parser.add_argument("-d", "--distance", type=int, default=1, help="The maximum edit distance for the search term")
    args = parser.parse_args()

    search_subtitles(args.subtitles, args.search, args.distance)
