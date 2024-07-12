/* eslint-disable camelcase */
'use server';

import User from '@/database/user.model';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../mongoose';
import { GetAllUsersParams, GetUserByIdParams } from './shared.types';

type UserParams = {
  id: string;
  email_addresses: { email_address: string }[];
  username: string | null;
  image_url: string;
};

export async function createOrUpdateUser({
  id,
  email_addresses,
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
