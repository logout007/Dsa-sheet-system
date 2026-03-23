require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('../src/models/Topic');
const Problem = require('../src/models/Problem');
const UserProgress = require('../src/models/UserProgress');

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not set. Copy .env.example to .env and fill in your values.');
  process.exit(1);
}

const topics = [
  { title: 'Arrays', description: 'Array manipulation and traversal problems', order: 1 },
  { title: 'Linked Lists', description: 'Singly and doubly linked list problems', order: 2 },
  { title: 'Trees', description: 'Binary trees, BSTs, and traversals', order: 3 },
  { title: 'Dynamic Programming', description: 'Memoization and tabulation techniques', order: 4 },
  { title: 'Graphs', description: 'BFS, DFS, shortest path, and connectivity', order: 5 },
];

const problemsByTopic = {
  Arrays: [
    { title: 'Two Sum', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/two-sum/', order: 1 },
    { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', order: 2 },
    { title: 'Contains Duplicate', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/contains-duplicate/', order: 3 },
    { title: 'Product of Array Except Self', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/product-of-array-except-self/', order: 4 },
    { title: 'Maximum Subarray', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/maximum-subarray/', order: 5 },
    { title: 'Maximum Product Subarray', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/maximum-product-subarray/', order: 6 },
    { title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', order: 7 },
    { title: 'Search in Rotated Sorted Array', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', order: 8 },
    { title: '3Sum', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/3sum/', order: 9 },
    { title: 'Container With Most Water', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/container-with-most-water/', order: 10 },
  ],
  'Linked Lists': [
    { title: 'Reverse Linked List', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/reverse-linked-list/', order: 1 },
    { title: 'Merge Two Sorted Lists', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/merge-two-sorted-lists/', order: 2 },
    { title: 'Linked List Cycle', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/linked-list-cycle/', order: 3 },
    { title: 'Remove Nth Node From End of List', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', order: 4 },
    { title: 'Reorder List', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/reorder-list/', order: 5 },
    { title: 'Add Two Numbers', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/add-two-numbers/', order: 6 },
    { title: 'Find the Duplicate Number', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/find-the-duplicate-number/', order: 7 },
    { title: 'Merge K Sorted Lists', difficulty: 'Hard', leetcodeLink: 'https://leetcode.com/problems/merge-k-sorted-lists/', order: 8 },
  ],
  Trees: [
    { title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', order: 1 },
    { title: 'Same Tree', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/same-tree/', order: 2 },
    { title: 'Invert Binary Tree', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/invert-binary-tree/', order: 3 },
    { title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', order: 4 },
    { title: 'Validate Binary Search Tree', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/validate-binary-search-tree/', order: 5 },
    { title: 'Kth Smallest Element in a BST', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', order: 6 },
    { title: 'Lowest Common Ancestor of a BST', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', order: 7 },
    { title: 'Construct Binary Tree from Preorder and Inorder', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', order: 8 },
    { title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', leetcodeLink: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', order: 9 },
    { title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', leetcodeLink: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', order: 10 },
  ],
  'Dynamic Programming': [
    { title: 'Climbing Stairs', difficulty: 'Easy', leetcodeLink: 'https://leetcode.com/problems/climbing-stairs/', order: 1 },
    { title: 'House Robber', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/house-robber/', order: 2 },
    { title: 'House Robber II', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/house-robber-ii/', order: 3 },
    { title: 'Longest Palindromic Substring', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/longest-palindromic-substring/', order: 4 },
    { title: 'Palindromic Substrings', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/palindromic-substrings/', order: 5 },
    { title: 'Coin Change', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/coin-change/', order: 6 },
    { title: 'Longest Increasing Subsequence', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/longest-increasing-subsequence/', order: 7 },
    { title: 'Unique Paths', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/unique-paths/', order: 8 },
    { title: 'Jump Game', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/jump-game/', order: 9 },
    { title: 'Word Break', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/word-break/', order: 10 },
  ],
  Graphs: [
    { title: 'Number of Islands', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/number-of-islands/', order: 1 },
    { title: 'Clone Graph', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/clone-graph/', order: 2 },
    { title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', order: 3 },
    { title: 'Course Schedule', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/course-schedule/', order: 4 },
    { title: 'Course Schedule II', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/course-schedule-ii/', order: 5 },
    { title: 'Graph Valid Tree', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/graph-valid-tree/', order: 6 },
    { title: 'Number of Connected Components', difficulty: 'Medium', leetcodeLink: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', order: 7 },
    { title: 'Alien Dictionary', difficulty: 'Hard', leetcodeLink: 'https://leetcode.com/problems/alien-dictionary/', order: 8 },
  ],
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('DB connected');

  await UserProgress.deleteMany({});
  await Problem.deleteMany({});
  await Topic.deleteMany({});
  console.log('Cleared existing data');

  const insertedTopics = await Topic.insertMany(topics);
  console.log(`Inserted ${insertedTopics.length} topics`);

  const topicMap = {};
  insertedTopics.forEach((t) => { topicMap[t.title] = t._id; });

  // Validate all topic keys exist in the inserted map before inserting problems
  for (const topicTitle of Object.keys(problemsByTopic)) {
    if (!topicMap[topicTitle]) {
      throw new Error(`Topic "${topicTitle}" not found in inserted topics — check for typos`);
    }
  }

  const allProblems = [];
  for (const [topicTitle, problems] of Object.entries(problemsByTopic)) {
    problems.forEach((p) => {
      allProblems.push({ ...p, topicId: topicMap[topicTitle], ytLink: '', articleLink: '' });
    });
  }

  const insertedProblems = await Problem.insertMany(allProblems);
  console.log(`Inserted ${insertedProblems.length} problems`);

  await mongoose.disconnect();
  console.log('Seed complete. DB disconnected.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
