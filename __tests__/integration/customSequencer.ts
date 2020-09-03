const TestSequencer = require('@jest/test-sequencer').default;
const path = require('path')

class CustomSequencer extends TestSequencer {
  sort(tests) {
    // orderPaths must be absolute paths
    const testsPath = './routes/v1/'
    const orderPath = [
      path.join(__dirname, testsPath, 'accountClaimToken.itest.ts'),
      path.join(__dirname, testsPath, 'addByRSSPodcastFeedUrl.itest.ts'),
      path.join(__dirname, testsPath, 'auth.itest.ts'),
      path.join(__dirname, testsPath, 'author.itest.ts'),
      path.join(__dirname, testsPath, 'category.itest.ts'),
      path.join(__dirname, testsPath, 'episode.itest.ts'),
      path.join(__dirname, testsPath, 'feedUrl.itest.ts'),
      path.join(__dirname, testsPath, 'mediaRef.itest.ts'),
      path.join(__dirname, testsPath, 'paypal.itest.ts'),
      path.join(__dirname, testsPath, 'playlist.itest.ts'),
      path.join(__dirname, testsPath, 'podcast.itest.ts'),
      path.join(__dirname, testsPath, 'user.itest.ts')
    ];

    return tests.sort((testA, testB) => {
      const indexA = orderPath.indexOf(testA.path);
      const indexB = orderPath.indexOf(testB.path);

      if (indexA === indexB) return 0; // do not swap when tests both not specify in order.

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA < indexB ? -1 : 1;
    })
  }
}

module.exports = CustomSequencer;

// Thanks to WeiAnAn for this example:
// https://github.com/facebook/jest/issues/6194#issuecomment-521521514
