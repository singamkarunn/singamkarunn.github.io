# LibraryPulse — public project notes

LibraryPulse is the portfolio display name for Smart Library ML Platform.

- Source: https://github.com/singamkarunn/smart-library-ml-platform
- Reviewed revision: 489da5db3cec54464d11a3ea178920bdc186e06e
- Review scope: source inspection, not full runtime or production certification.

## Purpose and implementation

The Python repository includes CSV/synthetic ingestion, feature modules, a hybrid recommendation engine (ALS, SVD, TF-IDF, optional BERT), FastAPI endpoints, Streamlit pages, Airflow DAGs, and monitoring code.

The portfolio companion is a separate static analytics demo. It does not run the Python models. GitHub Pages can serve the companion; the original Python application needs separate hosting.

## Public demo data

The deterministic JavaScript fixture uses seed 42 and 1,200 fictional checkouts across January–June 2024, 120 possible borrowers, 12 fictional titles, and six genres. It is not the Python generator's output. No real patron or employer information is included.

Fields: transaction_id (unique checkout), patron_id (fictional borrower), book_id (fictional title), book_title, genre, checkout_date (ISO date), loan_duration_days (generated integer 7–28).

Checkouts count filtered rows. Distinct borrowers and titles count distinct IDs in those rows. Mean loan days averages their durations. Popular titles are ranked by filtered checkout count, not personalized model scores.

## Evaluation and limitations

The README benchmark table is unpopulated. No improvement, prediction quality, production usage, or latency result is claimed. Some monitoring paths simulate prediction scores or recommendation samples. The browser fixture cannot establish model quality or real-world demand.

Recommended validation: chronological splits, a popularity baseline, Precision@10 / Recall@10 / NDCG@10, catalog coverage, cold-start breakdowns, reproducible run metadata, and workload-based latency measurements.

Before public Python hosting: remove arbitrary user-controlled API destinations, review authentication and authorization, load versioned model artifacts, replace simulated monitoring with actual logs, and complete a privacy review.

## Guide

Open the dashboard, choose month/genre, inspect matching metrics and charts, and download the filtered CSV. Reset filters to restore the complete fixture. The HTML technical documents offer a browser Print / Save as PDF action.

## Future work

Demand forecasting, acquisition decisions, branch transfer optimization, and live Python integration are future extensions—not implemented capabilities of this companion.
