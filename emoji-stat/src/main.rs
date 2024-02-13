use clap::Parser;
use counter::Counter;

use std::fs::File;
use std::io::{prelude::*, BufReader};

fn count_emojis(file_name: &String) -> Counter<String, usize> {
    use unicode_segmentation::UnicodeSegmentation;

    let file = File::open(file_name).expect("Unable to read file");
    let reader = BufReader::new(file);

    let mut counts: Counter<String, usize> = Counter::new();

    for line in reader.lines() {
        let line = line.unwrap();

        // this gives a decent speedup for text that does not include emojis in every line
        if line.is_ascii() {
            continue;
        }

        counts.update(
            line.graphemes(true)
                .filter(|g| emojis::get(g).is_some())
                .map(|g| g.to_string()),
        )
    }

    counts
}

fn frac_to_bar(frac: f32, len: usize) -> String {
    let len_target = len as f32 * frac;

    let full = len_target.floor() as usize;
    let partial = len_target - len_target.floor();
    let remaining = len - full - (partial.ceil() as usize);

    let chars = [' ', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];

    let mut bar = String::new();

    for _ in 0..full {
        bar.push(chars[chars.len() - 1]);
    }

    if partial != 0.0 {
        bar.push(chars[(partial * (chars.len() - 1) as f32).round() as usize])
    }

    for _ in 0..remaining {
        bar.push(chars[0]);
    }

    bar
}

fn pretty_print_counts(
    counts: &Counter<String, usize>,
    k: usize,
    file_name: &String,
    width: usize,
) {
    let total_emojis: usize = counts.values().sum();
    let max_count: usize = *counts.values().max().unwrap();
    let max_digits: usize = (max_count as f32).log10().ceil() as usize;

    // print the title
    let pad = std::cmp::max(0, width + max_digits - file_name.len() + 11);
    println!(
        "{} `{file_name}` {}",
        "=".repeat(pad / 2),
        "=".repeat(pad - pad / 2)
    );

    // print a bar for each emoji in the top k
    for (emoji, count) in counts.k_most_common_ordered(k) {
        let frac = count as f32 / max_count as f32;
        let percentage = count as f32 / total_emojis as f32 * 100.0;
        let bar = frac_to_bar(frac, width);

        println!(
            "+ {bar} {:>6.2}% {:width$}x {emoji}",
            percentage,
            count,
            width = max_digits
        );
    }
}

fn main() {
    /// Simple program to visualize the emojis used inside a text file
    #[derive(Parser, Debug)]
    #[command(version, about, long_about = None)]
    struct Args {
        /// The input file
        #[clap(index = 1)]
        input_file: String,

        /// Number of emojis to list
        #[arg(short, long, default_value_t = 20)]
        k: usize,

        /// Width of the bar diagram
        #[arg(short, long, default_value_t = 40)]
        width: usize,
    }

    let args = Args::parse();

    let counts = count_emojis(&args.input_file);

    if counts.len() == 0 {
        println!("No emojis found in input!");
        return;
    }

    pretty_print_counts(&counts, args.k, &args.input_file, args.width);
}
