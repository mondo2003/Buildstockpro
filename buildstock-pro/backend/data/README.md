# Data Directory

This directory contains data files used for testing and development of the buildstock-pro price scraping system.

## Files

### sample-prices.csv

**Purpose**: Test data file for price scraping operations and API testing.

**Contents**: CSV format sample price data for various power tools, hand tools, and gardening products from multiple retailers.

**Structure**:
- `product_name`: Name of the product
- `retailer`: Retailer name (screwfix, wickes, bandq, toolstation, travisperkins)
- `retailer_product_id`: Unique product ID from retailer
- `price`: Product price in GBP
- `currency`: Currency (GBP)
- `category`: Product category (power-tools, hand-tools, gardening)
- `in_stock`: Boolean indicating stock availability
- `stock_text`: Text description of stock status
- `brand`: Product brand name

**Status**: ACTIVE - Used for testing price scraping functionality and API endpoints

## Usage

This sample data is used for:
- Testing price scraping algorithms
- Validating API endpoints
- Development and debugging of the scraping system
- Performance testing

## Data Sources

The sample data contains mock data representing products from major UK retailers:
- Screwfix
- Wickes
- B&Q
- Toolstation
- Travis Perkins