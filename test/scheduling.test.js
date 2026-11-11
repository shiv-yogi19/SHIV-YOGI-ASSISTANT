/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * TEST SUITE 5: scheduling.test.js
 * Validates the scheduling engine: multimedia posts, exact IST parsing,
 * recurring intervals (daily/weekly/monthly), cancellation, retries,
 * and lock-protected queue execution.
 */

import {
  addScheduledPost,
  getScheduledList,
  cancelScheduledPost,
  retryFailedScheduledPost,
  deleteScheduledPost,
  processScheduledQueue,
  getScheduledPostsByStatus
} from "../modules/scheduled-posts.js";
import { parseDateIST, formatDateIST, DEFAULT_CONTENT } from "../modules/helpers.js";
import { MockTelegramApi, MockKV } from "./fixtures/mock-telegram.js";

console.log("==================================================");
console.log("⏰ STARTING SCHEDULING ENGINE TEST SUITE");
console.log("==================================================");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${details ? "- " + details : ""}`);
    testsFailed++;
  }
}

const mockApi = new MockTelegramApi();
mockApi.installGlobalFetch();

const env = {
  OWNER_ID: "8226363418",
  BOT_TOKEN: "777888999:AAFakeTokenForLocalTestingOnly12345",
  BOT_DATA: new MockKV()
};

await env.BOT_DATA.put("settings:config", DEFAULT_CONTENT.settings);
await env.BOT_DATA.put("settings:features", DEFAULT_CONTENT.features);

// 1. Date Parsing in Asia/Kolkata
const futureTs = parseDateIST("2026-11-20 18:45");
assert(futureTs !== null, "parseDateIST correctly parsed YYYY-MM-DD HH:mm");
assert(parseDateIST("invalid-date") === null, "parseDateIST returned null for invalid string");

// 2. Add Multimedia Scheduled Posts
const textPost = await addScheduledPost(env, {
  text: "Announcement 1",
  media_type: "text",
  post_at: Date.now() + 600000,
  channel_id: "@the_endless_playback"
});
assert(textPost.status === "pending" && textPost.media_type === "text", "Text post successfully scheduled");

const photoPost = await addScheduledPost(env, {
  text: "Artwork Wallpaper",
  media_type: "photo",
  media_id: "photo_file_id_123",
  post_at: Date.now() + 1200000,
  channel_id: "@the_endless_playback"
});
assert(photoPost.status === "pending" && photoPost.media_type === "photo", "Photo post successfully scheduled");

// 3. Status Filtering & Pagination
const pendingList = await getScheduledPostsByStatus(env, "pending", 1, 10);
assert(pendingList.total >= 2, "Scheduled list accurately reflects pending items");

// 4. Cancel Scheduled Post
const cancelRes = await cancelScheduledPost(env, photoPost.id);
assert(cancelRes === true, "cancelScheduledPost returned true");
const listAfterCancel = await getScheduledList(env);
const cancelledTarget = listAfterCancel.find(p => p.id === photoPost.id);
assert(cancelledTarget.status === "cancelled", "Post status updated to cancelled in KV");

// 5. Daily Recurring Post Execution & Re-queueing
const recurringPost = await addScheduledPost(env, {
  text: "Daily Wallpaper Drop Recurring",
  media_type: "text",
  post_at: Date.now() - 1000, // Due immediately
  channel_id: "@the_endless_playback",
  recurring: "daily"
});

mockApi.resetCalls();
const queueRes = await processScheduledQueue(env);
assert(queueRes.published >= 1, "processScheduledQueue successfully published due recurring post");

// Verify next occurrence was scheduled in queue
const updatedList = await getScheduledList(env);
const nextOccurrence = updatedList.find(p => p.recurring === "daily" && p.status === "pending" && p.id !== recurringPost.id);
assert(Boolean(nextOccurrence), "Recurring engine automatically queued the next daily occurrence");
assert(nextOccurrence.post_at > Date.now(), "Next daily occurrence is scheduled for the future");

// 6. Retry Logic on Failure
// Create a post destined for a simulated failure
const failingPost = await addScheduledPost(env, {
  text: "Post destined to fail",
  media_type: "text",
  post_at: Date.now() - 1000,
  channel_id: "@failing_channel"
});

// Configure mock to fail for this channel
mockApi.simulateFailure("sendMessage", 403, "Bot was kicked from channel");
await processScheduledQueue(env);

const listAfterFail1 = await getScheduledList(env);
const failedItem1 = listAfterFail1.find(p => p.id === failingPost.id);
assert(failedItem1.retries === 1, "First failure incremented retry counter to 1");
assert(failedItem1.status === "pending", "Post remains pending for next retry");

// Trigger 2 more failures to exceed limit
failedItem1.post_at = Date.now() - 1000;
await env.BOT_DATA.put("chan:scheduled_list", listAfterFail1);
await processScheduledQueue(env);

const listAfterFail2 = await getScheduledList(env);
const failedItem2 = listAfterFail2.find(p => p.id === failingPost.id);
failedItem2.post_at = Date.now() - 1000;
await env.BOT_DATA.put("chan:scheduled_list", listAfterFail2);
await processScheduledQueue(env);

const listAfterFail3 = await getScheduledList(env);
const failedItem3 = listAfterFail3.find(p => p.id === failingPost.id);
assert(failedItem3.retries >= 3, "Retry count reached maximum limit of 3");
assert(failedItem3.status === "failed", "Post status transitioned to failed after exceeding retries");

// 7. Manual Retry of Failed Post
mockApi.clearSimulations();
const manualRetryRes = await retryFailedScheduledPost(env, failedItem3.id);
assert(manualRetryRes === true, "retryFailedScheduledPost returned true");
const listAfterManualRetry = await getScheduledList(env);
const retriedItem = listAfterManualRetry.find(p => p.id === failedItem3.id);
assert(retriedItem.status === "pending" && retriedItem.retries === 0, "Failed post reset to pending with 0 retries");

// Clean up
await deleteScheduledPost(env, failedItem3.id);

console.log("==================================================");
console.log(`📊 SCHEDULING TEST SUITE SUMMARY: ${testsPassed} PASSED | ${testsFailed} FAILED`);
console.log("==================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
