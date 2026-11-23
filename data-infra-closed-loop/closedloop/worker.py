"""Continuously drain durable quality-check jobs in bounded batches."""
import argparse
import logging
import math
import signal
from threading import Event

from .core import Loop


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="runtime")
    parser.add_argument("--batch", type=int, default=100)
    parser.add_argument("--poll", type=float, default=2)
    args = parser.parse_args()
    if args.batch < 1 or not math.isfinite(args.poll) or args.poll <= 0:
        parser.error("batch and poll must be positive")
    logging.basicConfig(level=logging.INFO)
    stopped = Event()
    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, lambda *_: stopped.set())
    delay = args.poll
    while not stopped.is_set():
        try:
            loop = Loop(args.root)
            try:
                counts = loop.work(args.batch)
            finally:
                loop.close()
        except Exception:
            logging.exception("Worker batch failed; unfinished leases can be reclaimed")
            stopped.wait(delay)
            delay = min(max(60, args.poll), delay * 2)
            continue
        delay = args.poll
        if counts:
            logging.info("quality_batch=%s", counts)
        if sum(counts.values()) < args.batch:
            stopped.wait(args.poll)


if __name__ == "__main__":
    main()
