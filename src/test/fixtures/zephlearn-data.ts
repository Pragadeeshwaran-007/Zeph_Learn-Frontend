/**
 * Realistic ZephLearn fixture data — used as living documentation of
 * the expected API contract between the Spring Boot backend and this frontend.
 */

// ─── Users ───────────────────────────────────────────────────────────────────

export const MOCK_USER_REGULAR = {
  id: "101",
  name: "Priya Suresh",
  email: "priya@example.com",
  role: "user" as const,
  solvedProblems: ["1", "2"],
  streak: 5,
  rank: 42,
  createdAt: "2025-01-15T08:00:00Z",
};

export const MOCK_USER_ADMIN = {
  id: "1",
  name: "Pragadeesh Admin",
  email: "admin@zephlearn.com",
  role: "admin" as const,
  solvedProblems: ["1", "2", "3", "4", "5"],
  streak: 30,
  rank: 1,
  createdAt: "2024-06-01T00:00:00Z",
};

export const MOCK_JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDEiLCJuYW1lIjoiUHJpeWEgU3VyZXNoIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MjAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.fake_sig";

export const MOCK_ADMIN_JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IlByYWdhZGVlc2ggQWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MjAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.fake_sig";

// Login API response shapes
export const MOCK_LOGIN_RESPONSE = {
  token: MOCK_JWT_TOKEN,
  id: MOCK_USER_REGULAR.id,
  name: MOCK_USER_REGULAR.name,
  email: MOCK_USER_REGULAR.email,
  role: MOCK_USER_REGULAR.role,
  streak: MOCK_USER_REGULAR.streak,
};

export const MOCK_ADMIN_LOGIN_RESPONSE = {
  token: MOCK_ADMIN_JWT_TOKEN,
  id: MOCK_USER_ADMIN.id,
  name: MOCK_USER_ADMIN.name,
  email: MOCK_USER_ADMIN.email,
  role: MOCK_USER_ADMIN.role,
  streak: MOCK_USER_ADMIN.streak,
};

// Profile API response
export const MOCK_PROFILE_RESPONSE = {
  id: MOCK_USER_REGULAR.id,
  name: MOCK_USER_REGULAR.name,
  email: MOCK_USER_REGULAR.email,
  role: MOCK_USER_REGULAR.role,
  solvedProblemIds: MOCK_USER_REGULAR.solvedProblems,
  streak: MOCK_USER_REGULAR.streak,
  rank: MOCK_USER_REGULAR.rank,
  createdAt: MOCK_USER_REGULAR.createdAt,
};

// ─── Problems ─────────────────────────────────────────────────────────────────

/** Backend API shape (before fromApi() transforms it) */
export const MOCK_API_PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
    inputFormat: "First line: array of integers nums\nSecond line: integer target",
    outputFormat: "Two space-separated indices i and j such that nums[i] + nums[j] == target",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nExactly one valid answer exists.",
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1", hidden: false },
      { input: "3 2 4\n6", expectedOutput: "1 2", hidden: false },
      { input: "3 3\n6", expectedOutput: "0 1", hidden: true },
    ],
  },
  {
    id: 2,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    inputFormat: "A single string s",
    outputFormat: "An integer representing the length of the longest substring",
    constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
    testCases: [
      { input: "abcabcbb", expectedOutput: "3", hidden: false },
      { input: "bbbbb", expectedOutput: "1", hidden: false },
      { input: "pwwkew", expectedOutput: "3", hidden: true },
    ],
  },
  {
    id: 3,
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    category: "Trees, DFS",
    description:
      "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    inputFormat: "Tree nodes in level-order, -1 for null nodes",
    outputFormat: "true or false",
    constraints: "The number of nodes in the tree is in the range [1, 10^4].\n-2^31 <= Node.val <= 2^31 - 1",
    testCases: [
      { input: "2 1 3", expectedOutput: "true", hidden: false },
      { input: "5 1 4 -1 -1 3 6", expectedOutput: "false", hidden: false },
      { input: "1 -1 2 -1 3", expectedOutput: "true", hidden: true },
    ],
  },
  {
    id: 4,
    title: "Maximum Subarray",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description: "Given an integer array nums, find the subarray with the largest sum and return its sum.",
    inputFormat: "Space-separated integers",
    outputFormat: "Integer: maximum subarray sum",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", hidden: false },
      { input: "1", expectedOutput: "1", hidden: true },
    ],
  },
  {
    id: 5,
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    category: "Linked Lists, Heap",
    description: "Merge k sorted linked lists and return the sorted list.",
    inputFormat: "k lines, each containing a space-separated sorted list",
    outputFormat: "Single merged sorted list",
    constraints: "k == lists.length\n0 <= k <= 10^4",
    testCases: [
      { input: "1 4 5\n1 3 4\n2 6", expectedOutput: "1 1 2 3 4 4 5 6", hidden: false },
    ],
  },
];

/** Frontend-transformed shape (after fromApi()) */
export const MOCK_PROBLEMS = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy" as const,
    category: "Arrays",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
    inputFormat: "First line: array of integers nums\nSecond line: integer target",
    outputFormat: "Two space-separated indices i and j such that nums[i] + nums[j] == target",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nExactly one valid answer exists.",
    sampleTestCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1" },
      { input: "3 2 4\n6", expectedOutput: "1 2" },
    ],
    hiddenTestCases: [{ input: "3 3\n6", expectedOutput: "0 1" }],
  },
  {
    id: "2",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium" as const,
    category: "Sliding Window",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    inputFormat: "A single string s",
    outputFormat: "An integer representing the length of the longest substring",
    constraints: "0 <= s.length <= 5 * 10^4",
    sampleTestCases: [
      { input: "abcabcbb", expectedOutput: "3" },
      { input: "bbbbb", expectedOutput: "1" },
    ],
    hiddenTestCases: [{ input: "pwwkew", expectedOutput: "3" }],
  },
  {
    id: "3",
    title: "Validate Binary Search Tree",
    difficulty: "Medium" as const,
    category: "Trees, DFS",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree.",
    inputFormat: "Tree nodes in level-order, -1 for null nodes",
    outputFormat: "true or false",
    constraints: "1 <= nodes <= 10^4",
    sampleTestCases: [{ input: "2 1 3", expectedOutput: "true" }],
    hiddenTestCases: [{ input: "1 -1 2 -1 3", expectedOutput: "true" }],
  },
  {
    id: "4",
    title: "Maximum Subarray",
    difficulty: "Easy" as const,
    category: "Dynamic Programming",
    description: "Find the subarray with the largest sum.",
    inputFormat: "Space-separated integers",
    outputFormat: "Integer: maximum subarray sum",
    constraints: "1 <= nums.length <= 10^5",
    sampleTestCases: [{ input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" }],
    hiddenTestCases: [{ input: "1", expectedOutput: "1" }],
  },
  {
    id: "5",
    title: "Merge K Sorted Lists",
    difficulty: "Hard" as const,
    category: "Linked Lists, Heap",
    description: "Merge k sorted linked lists and return the sorted list.",
    inputFormat: "k lines, each a sorted list",
    outputFormat: "Merged sorted list",
    constraints: "0 <= k <= 10^4",
    sampleTestCases: [{ input: "1 4 5\n1 3 4\n2 6", expectedOutput: "1 1 2 3 4 4 5 6" }],
    hiddenTestCases: [],
  },
];

// ─── Submissions ──────────────────────────────────────────────────────────────

export const MOCK_SUBMISSIONS = [
  {
    id: "sub-1",
    userId: "101",
    problemId: "1",
    problem: "Two Sum",
    code: "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i",
    language: "python",
    verdict: "Accepted",
    time: "0.05",
    memory: 14340,
    submittedAt: "2026-07-17T14:30:00Z",
  },
  {
    id: "sub-2",
    userId: "101",
    problemId: "2",
    problem: "Longest Substring Without Repeating Characters",
    code: "// incomplete",
    language: "javascript",
    verdict: "Wrong Answer",
    time: "0.03",
    memory: 10240,
    submittedAt: "2026-07-17T15:00:00Z",
  },
  {
    id: "sub-3",
    userId: "101",
    problemId: "1",
    problem: "Two Sum",
    code: "// brute force",
    language: "cpp",
    verdict: "Time Limit Exceeded",
    time: "2.01",
    memory: 8192,
    submittedAt: "2026-07-16T10:00:00Z",
  },
];

export const MOCK_SUBMIT_RESPONSE_ACCEPTED = {
  verdict: "Accepted",
  passedCount: 3,
  totalCount: 3,
  results: [
    {
      input: "2 7 11 15\n9",
      expectedOutput: "0 1",
      actualOutput: "0 1",
      passed: true,
      executionTime: "0.05s",
    },
    {
      input: "3 2 4\n6",
      expectedOutput: "1 2",
      actualOutput: "1 2",
      passed: true,
      executionTime: "0.04s",
    },
    {
      input: "3 3\n6",
      expectedOutput: "0 1",
      actualOutput: "0 1",
      passed: true,
      executionTime: "0.04s",
    },
  ],
  executionTime: "0.05s",
  memory: "14340",
};

export const MOCK_SUBMIT_RESPONSE_WRONG = {
  verdict: "Wrong Answer",
  passedCount: 1,
  totalCount: 3,
  results: [
    {
      input: "2 7 11 15\n9",
      expectedOutput: "0 1",
      actualOutput: "0 1",
      passed: true,
      executionTime: "0.04s",
    },
    {
      input: "3 2 4\n6",
      expectedOutput: "1 2",
      actualOutput: "0 2",
      passed: false,
      executionTime: "0.03s",
    },
    {
      input: "3 3\n6",
      expectedOutput: "0 1",
      actualOutput: "",
      passed: false,
      executionTime: "0.03s",
    },
  ],
  executionTime: "0.04s",
  memory: "10240",
};

// ─── Judge0 / Run ─────────────────────────────────────────────────────────────

export const MOCK_RUN_ACCEPTED = {
  stdout: "0 1\n",
  stderr: null,
  verdict: "Accepted",
  executionTime: "0.05",
  memory: 14340,
};

export const MOCK_RUN_WRONG = {
  stdout: "0 2\n",
  stderr: null,
  verdict: "Wrong Answer",
  executionTime: "0.04",
  memory: 10240,
};

export const MOCK_RUN_COMPILE_ERROR = {
  stdout: null,
  stderr: "SyntaxError: invalid syntax (line 1)",
  verdict: "Compilation Error",
  executionTime: null,
  memory: null,
};

// ─── Notifications ────────────────────────────────────────────────────────────

/** Backend shape (isRead field) */
export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Problem: Graph Coloring Challenge",
    message: "A new Hard problem on graph algorithms has been added. Test your DFS/BFS skills!",
    createdByAdminId: 1,
    createdAt: "2026-07-17T10:00:00Z",
    isRead: false,
    readAt: null,
  },
  {
    id: 2,
    title: "Weekly Contest #12 Results",
    message: "Congratulations to top scorers! Priya Suresh ranked #42. Full results on the leaderboard.",
    createdByAdminId: 1,
    createdAt: "2026-07-15T18:00:00Z",
    isRead: true,
    readAt: "2026-07-16T09:30:00Z",
  },
  {
    id: 3,
    title: "Platform Maintenance Notice",
    message: "Scheduled maintenance on July 20, 2026 from 2:00 AM to 4:00 AM IST. Save your code locally.",
    createdByAdminId: 1,
    createdAt: "2026-07-14T12:00:00Z",
    isRead: false,
    readAt: null,
  },
];
