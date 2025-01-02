# Solana Token Analysis Platform - Migration Roadmap

## 1. Database Schema Updates
- [ ] Rename tables from firm-focused to token-focused
  - `firm_analyses` -> `token_analyses`
  - `search_history` -> `token_search_history`
  - `leaderboard` -> `token_leaderboard`
- [ ] Update column structures for token-specific data

## 2. Core Type Definitions
- [ ] Create new interfaces for token data
- [ ] Update existing types to reflect token analysis
- [ ] Add Solana-specific types and validations

## 3. Data Source Integration
- [ ] Implement Jupiter API integration
- [ ] Set up Solana RPC connection
- [ ] Configure Exa API for crypto sources
  - GMGN.ai scraping
  - DexScreener data
  - Twitter/social sentiment

## 4. Component Updates
- [ ] Modify SearchBar for address input
  - Add address validation
  - Add QR code scanner
- [ ] Update ReportCard for token metrics
- [ ] Revise Leaderboard for token rankings

## 5. API Route Updates
- [ ] Transform analyze-firm to analyze-token
- [ ] Update chat route for token context
- [ ] Add new endpoints for token-specific data

## 6. UI/UX Improvements
- [ ] Update page title and metadata
- [ ] Add token-specific icons and graphics
- [ ] Implement price chart component
- [ ] Add token verification badges

## 7. Utils & Helpers
- [ ] Add Solana address validation
- [ ] Create token data fetching utilities
- [ ] Implement price/liquidity calculations
- [ ] Add token metadata helpers

## 8. Testing & Optimization
- [ ] Test with various token types
- [ ] Optimize data caching
- [ ] Add error handling for invalid tokens
- [ ] Implement rate limiting

## 9. Documentation
- [ ] Update API documentation
- [ ] Add token analysis methodology
- [ ] Create user guide for token searches 