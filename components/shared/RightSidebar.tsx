import Image from 'next/image';
import Link from 'next/link';
import RenderTag from './RenderTag';

const hotQuestions = [
  {
    _id: '1',
    title: 'How to manage state in React applications?',
  },
  {
    _id: '2',
    title: 'What are the best practices for securing a Node.js application?',
  },
  {
    _id: '3',
    title: 'How to optimize performance in a full stack web application?',
  },
  {
    _id: '4',
    title: 'What is the difference between SQL and NoSQL databases?',
  },
  {
    _id: '5',
    title:
      'How to handle authentication and authorization in a MERN stack application?',
  },
];

const popularTags = [
  {
    _id: '1',
    name: 'JavaScript',
    numberOfQuestions: 34000,
  },
  {
    _id: '2',
    name: 'Python',
    numberOfQuestions: 29000,
  },
  {
    _id: '3',
    name: 'Java',
    numberOfQuestions: 23000,
  },
  {
    _id: '4',
    name: 'Ruby',
    numberOfQuestions: 12000,
  },
  {
    _id: '5',
    name: 'PHP',
    numberOfQuestions: 15000,
  },
];

const RightSidebar = () => {
  return (
    <section className="background-light900_dark200 light-border custom-scrollbar sticky right-0 top-0 flex h-screen w-[350px] flex-col overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map((question) => (
            <Link
              href={`/question/${question._id}`}
              key={question._id}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">
                {question.title}
              </p>
              <Image
                src="/assets/icons/chevron-right.svg"
                alt="chevron right"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              totalQuestions={tag.numberOfQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
