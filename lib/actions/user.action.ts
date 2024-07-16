/* eslint-disable camelcase */
'use server';

import Answer from '@/database/answer.model';
import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import User from '@/database/user.model';
import { FilterQuery } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../mongoose';
import {
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
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

    const users = await User.find({}).sort({ joinedAt: -1 });

    return { users };
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

    const { clerkId, searchQuery } = params;

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, 'i') } }
      : {};

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: { createdAt: -1 },
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

    return { questions: savedQuestions };
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

    return { user, totalQuestions, totalAnswers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalQuestions = await Question.countDocuments({ author: userId });

    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('tags', '_id name')
      .populate('author', '_id clerkId name picture');

    return { totalQuestions, questions: userQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    await connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalAnswers = await Answer.countDocuments({ author: userId });

    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('question', '_id title')
      .populate('author', '_id clerkId name picture');

    return { totalAnswers, answers: userAnswers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
