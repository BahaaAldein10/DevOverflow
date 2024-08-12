/* eslint-disable camelcase */
'use server';

import Answer from '@/database/answer.model';
import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import User from '@/database/user.model';
import { BadgeCriteriaType } from '@/types';
import { FilterQuery } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../mongoose';
import { assignBadges } from '../utils';
import {
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  UpdateUserParams,
} from './shared.types';

type UserParams = {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string;
  username: string | null;
  image_url: string;
};

export async function createOrUpdateUser({
  id,
  email_addresses,
  first_name,
  username,
  image_url,
}: UserParams) {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          email: email_addresses[0].email_address,
          name: first_name,
          username,
          picture: image_url,
        },
      },
      { upsert: true, new: true }
    );

    await user.save();

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(id: string | undefined) {
  try {
    await connectToDatabase();

    await User.findOneAndDelete({ clerkId: id });
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    await connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserById(params: GetUserByIdParams) {
  try {
    await connectToDatabase();
    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    await connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    const query: FilterQuery<typeof User> = {};

    if (searchQuery) {
      query.$or = [
        {
          name: { $regex: new RegExp(searchQuery, 'i') },
        },
        {
          username: { $regex: new RegExp(searchQuery, 'i') },
        },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case 'new_users':
        sortOptions = { joinedAt: -1 };
        break;
      case 'old_users':
        sortOptions = { joinedAt: 1 };
        break;
      case 'top_contributors':
        sortOptions = { reputation: -1 };
        break;
      default:
        break;
    }

    const skipAmount = (page - 1) * pageSize;

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsers = await User.countDocuments(query);
    const isNext = totalUsers > skipAmount + users.length;

    return { users, isNext, totalUsers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

interface SaveQuestionParams {
  questionId: string;
  userId: string;
  hasSaved: boolean;
  path: string;
}

export async function saveQuestion(params: SaveQuestionParams) {
  try {
    await connectToDatabase();

    const { questionId, userId, hasSaved, path } = params;

    let updateQuery = {};

    if (hasSaved) {
      updateQuery = { $pull: { saved: questionId } };
    } else {
      updateQuery = { $addToSet: { saved: questionId } };
    }

    const user = await User.findByIdAndUpdate(userId, updateQuery, {
      new: true,
    });

    if (!user) throw new Error('User not found!');

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    await connectToDatabase();

    const { clerkId, searchQuery, filter, page = 1, pageSize = 5 } = params;

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, 'i') } }
      : {};

    let sortOptions = {};

    switch (filter) {
      case 'most_recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'most_voted':
        sortOptions = { upvotes: -1 };
        break;
      case 'most_viewed':
        sortOptions = { views: -1 };
        break;
      case 'most_answered':
        sortOptions = { answers: -1 };
        break;
      default:
        break;
    }

    const skipAmount = (page - 1) * pageSize;

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: pageSize,
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        {
          path: 'author',
          model: User,
          select: '_id clerkId picture name',
        },
      ],
    });

    if (!user) throw new Error('User not found!');

    const savedQuestions = user.saved;

    const isNext = user.saved.length > pageSize;

    return { questions: savedQuestions, isNext };
  } catch (error) {
    console.log(error);
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    await connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error('User not found!');
    }

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    const [questionsUpvotes] = await Question.aggregate([
      { $match: { author: userId } },
      { $project: { _id: 0, upvotes: { $size: '$upvotes' } } },
      { $group: { _id: null, totalUpvotes: { $sum: '$upvotes' } } },
    ]);
    const [answersUpvotes] = await Answer.aggregate([
      { $match: { author: userId } },
      { $project: { _id: 0, upvotes: { $size: '$upvotes' } } },
      { $group: { _id: null, totalUpvotes: { $sum: '$upvotes' } } },
    ]);
    const [questionsViews] = await Question.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]);

    const criteria = [
      { type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions },
      { type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers },
      {
        type: 'QUESTION_UPVOTES' as BadgeCriteriaType,
        count: questionsUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'ANSWER_UPVOTES' as BadgeCriteriaType,
        count: answersUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'TOTAL_VIEWS' as BadgeCriteriaType,
        count: questionsViews?.totalViews || 0,
      },
    ];

    const badgeCounts = assignBadges({ criteria });

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 2 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalQuestions = await Question.countDocuments({ author: userId });

    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('tags', '_id name')
      .populate('author', '_id clerkId name picture');

    const isNext = totalQuestions > skipAmount + userQuestions.length;

    return { totalQuestions, questions: userQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    await connectToDatabase();

    const { userId, page = 1, pageSize = 3 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalAnswers = await Answer.countDocuments({ author: userId });

    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('question', '_id title')
      .populate('author', '_id clerkId name picture');

    const isNext = totalAnswers > skipAmount + userAnswers.length;

    return { totalAnswers, answers: userAnswers, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
