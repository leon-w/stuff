from argparse import ArgumentParser
from datetime import datetime
from pathlib import Path

import matplotlib.pyplot as plt

from git import Repo


def DayFormatter(x: float, _=0.0) -> str:
    return datetime.fromordinal(int(x)).strftime("%d.%m.%Y")


def print_histogram(repo_path: Path, metric="commits"):
    repo = Repo(repo_path)

    commits = list(repo.iter_commits())
    commits.sort(key=lambda commit: commit.committed_date)
    commit_days = [commit.committed_datetime.date().toordinal() for commit in commits]

    if metric == "commits":
        weights = None
    elif metric == "lines":
        weights = [commit.stats.total["lines"] for commit in commits]
    else:
        raise ValueError("Invalid metric")

    fig = plt.figure()
    ax = fig.add_subplot()

    ax.hist(commit_days, weights=weights, bins=(commit_days[-1] - commit_days[0]))
    ax.xaxis.set_major_formatter(DayFormatter)
    ax.locator_params(axis="x", nbins=20)
    ax.tick_params(axis="x", labelrotation=90)
    ax.set_ylabel(metric)

    # add some padding to the bottom
    fig.subplots_adjust(bottom=0.2)

    repo_name = Path(repo.working_dir).name
    plt.title(f"Commit history of {repo_name}")

    plt.show()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("repo", type=Path)
    parser.add_argument("--metric", choices=["commits", "lines"], default="commits")
    args = parser.parse_args()

    print_histogram(args.repo, args.metric)
