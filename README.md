# Library Printer Status Dashboard

This project provides a web interface to monitor the status of color and black & white printers in a library environment. It scrapes information from the printers' web interfaces to display their current status, including any error messages or warnings.

## Installation

To install and run this project locally, follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies using npm:

```bash
npm install
```
3. Run the server using the following command:

```bash
node index.js
```

4. Open a web browser and navigate to http://localhost:8080 to view the printer status dashboard.

## Usage

The web interface provides a list of color printers and black & white printers, along with their current status. Each printer entry includes its location and a list of status messages, which are scraped from the printer's web interface.

Printers with errors or warnings are highlighted in red, while printers with no issues are highlighted in green.

Clicking on a printer entry opens a new tab with the printer's web interface for further investigation or troubleshooting.

## Technologies Used
* Node.js
* Express.js
* Cheerio (for web scraping)
* HTML
* CSS
