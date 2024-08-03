'use client';

import Image from 'next/image';
import Link from 'next/link';
import Metric from '../shared/Metric';
import { Badge } from '../ui/badge';

interface Props {
  job: {
    employer_name: string;
    employer_logo: string;
    employer_website: string;
    job_title: string;
    job_city: string;
    job_state: string;
    job_country: string;
    job_description: string;
    job_employment_type?: string;
    job_apply_link: string;
  };
}

function JobCard({ job }: Props) {
  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex gap-6">
        {job.employer_website ? (
          <Link
            href={job.employer_website}
            className="background-light800_dark400 relative size-16 rounded-xl"
          >
            <Image
              src={
                job.employer_logo
                  ? job.employer_logo
                  : '/assets/icons/avatar.svg'
              }
              alt={job.employer_name}
              width={1000}
              height={1000}
              className="size-full object-contain p-2"
            />
          </Link>
        ) : (
          <div className="background-light800_dark400 relative size-16 rounded-xl">
            <Image
              src={
                job.employer_logo
                  ? job.employer_logo
                  : '/assets/icons/avatar.svg'
              }
              alt={job.employer_name}
              width={1000}
              height={1000}
              className="size-full object-contain p-2"
            />
          </div>
        )}

        <div className="w-full">
          <div className="flex flex-wrap items-center justify-between">
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1">
              {job.job_title}
            </h3>

            <Badge className="background-light800_dark400 flex items-center justify-end gap-2 rounded-2xl px-3 py-1.5">
              <Image
                src="/assets/icons/account.svg"
                alt="flag"
                width={16}
                height={16}
              />
              <p className="body-medium text-dark400_light700">
                {job.job_city}, {job.job_state}, {job.job_country}
              </p>
            </Badge>
          </div>

          <p className="body-regular text-dark500_light700  mt-2 line-clamp-2">
            {job.job_description}
          </p>

          <div className="flex-between mt-6 w-full flex-wrap gap-3">
            <div className="flex gap-6">
              <Metric
                imgUrl="/assets/icons/clock-2.svg"
                alt="user"
                title={job.job_employment_type}
                textStyles="body-medium text-dark400_light700"
              />
              <Metric
                imgUrl="/assets/icons/currency-dollar-circle.svg"
                alt="user"
                title="Not disclosed"
                textStyles="body-medium text-dark400_light700"
              />
            </div>

            <Link
              href={job.job_apply_link}
              target="_blank"
              className="flex items-center"
            >
              <p className="body-semibold primary-text-gradient">View Job</p>
              <Image
                src="/assets/icons/arrow-up-right.svg"
                alt="arrow up right"
                width={20}
                height={20}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobCard;
