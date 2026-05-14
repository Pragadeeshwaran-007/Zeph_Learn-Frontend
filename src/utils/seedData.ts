import type { Problem } from "@/services/problemService";

export const SEED_PROBLEMS: Problem[] = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    inputFormat: "First line: n and target.\nSecond line: n integers (the array).",
    outputFormat: "Two space-separated indices.",
    constraints: "2 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9",
    sampleTestCases: [
      { input: "4 9\n2 7 11 15", expectedOutput: "0 1" },
      { input: "3 6\n3 2 4", expectedOutput: "1 2" },
    ],
    hiddenTestCases: [
      { input: "2 6\n3 3", expectedOutput: "0 1" },
      { input: "5 10\n1 2 3 4 6", expectedOutput: "2 4" },
    ],
  },
  {
    id: "2",
    title: "Reverse a String",
    difficulty: "Easy",
    category: "String",
    description: "Given a string, output its reverse.",
    inputFormat: "A single line containing the string.",
    outputFormat: "The reversed string.",
    constraints: "1 <= |s| <= 10^5",
    sampleTestCases: [
      { input: "hello", expectedOutput: "olleh" },
      { input: "Zephlearn", expectedOutput: "nraelhpeZ" },
    ],
    hiddenTestCases: [
      { input: "abc", expectedOutput: "cba" },
      { input: "racecar", expectedOutput: "racecar" },
    ],
  },
  {
    id: "3",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description: "Given a string of brackets, determine if it is valid (every opener has a matching closer in the correct order).",
    inputFormat: "A single line containing brackets.",
    outputFormat: "true or false",
    constraints: "1 <= |s| <= 10^4",
    sampleTestCases: [
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
    ],
    hiddenTestCases: [
      { input: "{[]}", expectedOutput: "true" },
      { input: "((()", expectedOutput: "false" },
    ],
  },
  {
    id: "4",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "String",
    description: "Given a string, find the length of the longest substring without repeating characters.",
    inputFormat: "A single line string.",
    outputFormat: "Single integer.",
    constraints: "0 <= |s| <= 5*10^4",
    sampleTestCases: [
      { input: "abcabcbb", expectedOutput: "3" },
      { input: "bbbbb", expectedOutput: "1" },
    ],
    hiddenTestCases: [
      { input: "pwwkew", expectedOutput: "3" },
      { input: "", expectedOutput: "0" },
    ],
  },
  {
    id: "5",
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Graph",
    description: "Given an m x n 2D grid of '1's (land) and '0's (water), return the number of islands.",
    inputFormat: "First line: m n.\nNext m lines: strings of length n with 0/1.",
    outputFormat: "Single integer.",
    constraints: "1 <= m,n <= 300",
    sampleTestCases: [
      { input: "4 5\n11110\n11010\n11000\n00000", expectedOutput: "1" },
      { input: "4 5\n11000\n11000\n00100\n00011", expectedOutput: "3" },
    ],
    hiddenTestCases: [
      { input: "1 1\n0", expectedOutput: "0" },
      { input: "1 1\n1", expectedOutput: "1" },
    ],
  },
  {
    id: "6",
    title: "Coin Change",
    difficulty: "Medium",
    category: "DP",
    description: "Given coins of different denominations and an amount, return the fewest number of coins to make up that amount, or -1.",
    inputFormat: "First line: n amount.\nSecond line: n coin denominations.",
    outputFormat: "Single integer.",
    constraints: "1 <= n <= 12, 0 <= amount <= 10^4",
    sampleTestCases: [
      { input: "3 11\n1 2 5", expectedOutput: "3" },
      { input: "1 3\n2", expectedOutput: "-1" },
    ],
    hiddenTestCases: [
      { input: "1 0\n1", expectedOutput: "0" },
      { input: "2 6\n1 5", expectedOutput: "2" },
    ],
  },
  {
    id: "7",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    category: "Array",
    description: "Given two sorted arrays nums1 and nums2 of size m and n, return the median.",
    inputFormat: "Line 1: m n.\nLine 2: m integers.\nLine 3: n integers.",
    outputFormat: "A floating point number.",
    constraints: "0 <= m,n <= 1000",
    sampleTestCases: [
      { input: "2 1\n1 3\n2", expectedOutput: "2.0" },
      { input: "2 2\n1 2\n3 4", expectedOutput: "2.5" },
    ],
    hiddenTestCases: [
      { input: "0 1\n\n1", expectedOutput: "1.0" },
      { input: "1 1\n2\n1", expectedOutput: "1.5" },
    ],
  },
  {
    id: "8",
    title: "Word Ladder",
    difficulty: "Hard",
    category: "Graph",
    description: "Given two words, beginWord and endWord, and a dictionary wordList, return the shortest transformation length from beginWord to endWord.",
    inputFormat: "Line 1: beginWord endWord n.\nNext n lines: dictionary words.",
    outputFormat: "Single integer (0 if impossible).",
    constraints: "1 <= n <= 5000",
    sampleTestCases: [
      { input: "hit cog 6\nhot\ndot\ndog\nlot\nlog\ncog", expectedOutput: "5" },
      { input: "hit cog 5\nhot\ndot\ndog\nlot\nlog", expectedOutput: "0" },
    ],
    hiddenTestCases: [
      { input: "a c 2\nb\nc", expectedOutput: "2" },
      { input: "abc def 1\ndef", expectedOutput: "0" },
    ],
  },
];
