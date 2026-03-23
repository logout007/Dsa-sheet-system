const { sendSuccess, sendError } = require('../utils/response');

const LC_GRAPHQL = 'https://leetcode.com/graphql';

const PROBLEM_QUERY = `
query getProblem($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    titleSlug
    difficulty
    content
    exampleTestcases
    topicTags { name }
    codeSnippets { lang langSlug code }
    hints
    stats
  }
}`;

// Extract slug from a full leetcode URL or return as-is if already a slug
function extractSlug(input) {
  if (!input) return null;
  // https://leetcode.com/problems/two-sum/ → two-sum
  const match = input.match(/leetcode\.com\/problems\/([^/?#]+)/);
  return match ? match[1] : input.trim();
}

exports.getProblem = async (req, res, next) => {
  try {
    const slug = extractSlug(req.query.slug);
    if (!slug) return sendError(res, 'slug query param is required', 400);

    const response = await fetch(LC_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({ query: PROBLEM_QUERY, variables: { titleSlug: slug } }),
    });

    if (!response.ok) {
      return sendError(res, 'Failed to fetch from LeetCode', 502);
    }

    const json = await response.json();
    const question = json?.data?.question;

    if (!question) return sendError(res, 'Problem not found on LeetCode', 404);

    sendSuccess(res, question);
  } catch (err) {
    next(err);
  }
};
