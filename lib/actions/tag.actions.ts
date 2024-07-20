'use server';

import Question from '@/database/question.model';
import Tag, { ITag } from '@/database/tag.model';
import User from '@/database/user.model';
import { FilterQuery } from 'mongoose';
import { connectToDatabase } from '../mongoose';
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from './shared.types';

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    await connectToDatabase();

    const { userId } = params;

    const user = await User.findById(userId);

    if (!user) throw new Error('User not found!');

    return ['tag1', 'tag2', 'tag3'];
  } catch (error) {
    console.log(error);
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDatabase();

    const { searchQuery } = params;

    const query: FilterQuery<typeof Tag> = searchQuery
      ? { name: { $regex: new RegExp(searchQuery, 'i') } }
      : {};

    const tags = await Tag.find(query);

    return { tags };
  } catch (error) {
    console.log(error);
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    await connectToDatabase();

    const { tagId, searchQuery } = params;

    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    const query: FilterQuery<typeof Tag> = {};

    if (searchQuery) {
      query.$or = [
        {
          title: { $regex: new RegExp(searchQuery, 'i') },
        },
        {
          content: { $regex: new RegExp(searchQuery, 'i') },
        },
      ];
    }

    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      match: query,
      model: Question,
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    });

    if (!tag) {
      throw new Error('Tag not found');
    }

    const questions = tag.questions;

    return { tagTitle: tag.name, questions };
  } catch (error) {
    console.log(error);
  }
}

export async function getTopPopularTags() {
  try {
    await connectToDatabase();

    const popularTags = await Tag.aggregate([
      {
        $project: { name: 1, numberOfQuestions: { $size: '$questions' } },
      },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);

    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
