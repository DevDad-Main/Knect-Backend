import { Story } from "../models/Story.models.js";
import { User } from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { uploadOnImageKit } from "../utils/imageKit.utils.js";
import { inngest } from "../utils/inngest.utils.js";

//#region Add A Story
export const addStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;

    const media = req.file;
    let media_url = "";

    if (media_type === "image" || media_type === "video") {
      media_url = await uploadOnImageKit(media, "1280");
    }

    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    // Trigger Inngest function to delete story in 24 hours
    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, story, "Story Added Successfully"));
  } catch (error) {
    throw new ApiError(404, "Not Authorized", error.message);
  }
};
//#endregionza

//#region Get Stories
export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    // Get Users connections and followings
    const userIds = [user, ...user.connections, ...user.following];

    // We then search our stories DB for these users stories
    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, stories, "Story Added Successfully"));
  } catch (error) {
    throw new ApiError(404, "Not Authorized", error.message);
  }
};
//#endregion
