const CossIOLib = require('./../lib');

const main = async () => {
  try {
    const cossIO = new CossIOLib.CossIO({
      cfduid: '',
      coss: '',
      xsrf: '',
    });

    const session = await cossIO.requestSession();
    console.log('Session:', session);
    console.log('---------------------------------');

    // try {
    //   const userWallets = await cossIO.requestUserWallets();
    //   console.log('User Wallets:');
    //   for (const wallet of userWallets) {
    //     console.log(
    //       `- '${wallet.currencyDisplayLabel} (${
    //         wallet.currencyCode
    //       })' - '${wallet.availableBalance.toFixed(8)}'`,
    //     );
    //   }
    //   console.log('---------------------------------');
    // } catch (error) {
    //   console.error('Failed to request user wallets', error);
    // }

    // try {
    //   const placedOrder = await cossIO.placeOrder({
    //     symbol: 'coss-eth',
    //     side: CossIOLib.CossIOOrderSide.BUY,
    //     type: CossIOLib.CossIOOrderType.LIMIT,
    //     price: 0.0005,
    //     amount: 10,
    //     session,
    //   });
    //   console.log('Placed Order:', placedOrder);
    //   console.log('---------------------------------');
    // } catch (error) {
    //   console.error('Failed to place order', error);
    // }

    try {
      const userOrders = await cossIO.requestUserOrders({ symbol: 'coss-eth' });
      console.log('User Orders:', userOrders);
      console.log('---------------------------------');
    } catch (error) {
      console.error('Failed to request user orders', error);
    }

    // try {
    //   const orderHistory = await cossIO.requestOrderHistory({ symbol: 'coss-eth' });
    //   console.log('Order History:', orderHistory);
    //   console.log('---------------------------------');
    // } catch (error) {
    //   console.error('Failed to request order history', error);
    // }

    // try {
    //   const depth = await cossIO.requestDepth({ symbol: 'coss-eth' });
    //   console.log('Depth:');
    //   console.log('First Bid', depth.bids[0]);
    //   console.log('First Ask', depth.asks[0]);
    //   console.log('---------------------------------');
    // } catch (error) {
    //   console.error('Failed to request depth', error);
    // }

    try {
      const tickers = await cossIO.requestTickers();
      console.log('All Tickers:');
      for (const pair of tickers) {
        console.log(`- '${pair.tradingPair.id}' - Price: '${pair.price.toFixed(8)}'`);
      }
      console.log('---------------------------------');
    } catch (error) {
      console.error('Failed to request ticker list', error);
    }

    const intervalTicker = async () => {
      try {
        const tickerCossETH = await cossIO.requestTicker({ symbol: 'coss-eth' });
        console.log('Ticker: COSS/ETH');
        console.log(`Current Price: '${tickerCossETH.price.toFixed(8)}'`);
        console.log('---------------------------------');

        const tickerCossBTC = await cossIO.requestTicker({ symbol: 'coss-btc' });
        console.log('Ticker: COSS/BTC');
        console.log(`Current Price: '${tickerCossBTC.price.toFixed(8)}'`);
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
