import { CossIO, CossIOTickerList } from './../lib';

const main = async () => {
  try {
    const cossIO = new CossIO();

    try {
      const session = await cossIO.requestSession();
      console.log('Session:', session);
      console.log('---------------------------------');
    } catch (error) {
      console.error('Failed to request session', error);
    }

    try {
      const depth = await cossIO.requestDepth({ symbol: 'coss-eth' });
      console.log('Depth:');
      console.log('First Bid', depth.bids[0]);
      console.log('First Ask', depth.asks[0]);
      console.log('---------------------------------');
    } catch (error) {
      console.error('Failed to request depth', error);
    }

    try {
      const tickers: CossIOTickerList = await cossIO.requestTickers();
      console.log('All Tickers:');
      for (const pair of tickers) {
        console.log(`- '${pair.tradingPair.id}'`);
      }
      console.log('---------------------------------');
    } catch (error) {
      console.error('Failed to request ticker list', error);
    }

    const intervalTicker = async () => {
      try {
        const tickerCossETH = await cossIO.requestTicker({ symbol: 'coss-eth' });
        console.log('Ticker: COSS/ETH');
        console.log(`Current Price: '${tickerCossETH.price}'`);
        console.log('---------------------------------');

        const tickerCossBTC = await cossIO.requestTicker({ symbol: 'coss-btc' });
        console.log('Ticker: COSS/BTC');
        console.log(`Current Price: '${tickerCossBTC.price}'`);
        console.log('---------------------------------');
      } catch (error) {
        console.error('Failed to request ticker', error);
      }
    };

    intervalTicker();
    setInterval(intervalTicker, 10000);
  } catch (error) {
    console.error('Something bad happend :/', error);
  }
};

main();
