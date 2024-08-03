'use client';

import JobCard from '@/components/cards/JobCard';
import Filter from '@/components/shared/Filter';
import LocalSearchbar from '@/components/shared/LocalSearchbar';
import Pagination from '@/components/shared/Pagination';
import { formUrlQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Job {
  employer_name: string;
  employer_logo: string;
  employer_website: string;
  job_title: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_description: string;
  job_employment_type: string;
  job_apply_link: string;
}

interface Country {
  name: string;
  value: string;
  flagSvg: string;
}

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [countryCode, setCountryCode] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);

  const searchParams = useSearchParams();
  const router = useRouter();

  const pageNumber = Number(searchParams.get('page')) || 1;
  const limit = 5;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch jobs with pagination parameters
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/search`
        );

        const responseData = await response.json();
        const result = responseData.result;
        const totalItems = responseData.totalItems;

        console.log(result);
        console.log(totalItems);

        // Calculate the total number of pages
        setTotalPages(Math.ceil(totalItems / limit));

        setJobs(result);
      } catch (error) {
        console.log(error);
      }
    };

    fetchJobs();
  }, [pageNumber]);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch(
          'http://ip-api.com/json/?fields=status,message,countryCode'
        );

        const result = await response.json();
        setCountryCode(result.countryCode);
      } catch (error) {
        console.log(error);
      }
    };

    fetchIP();
  }, []);

  useEffect(() => {
    if (!searchParams.has('filter')) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'filter',
        value: countryCode.toLowerCase(),
      });

      router.push(newUrl);
    }
  }, [router, searchParams, countryCode]);

  const searchQuery = searchParams.get('q')?.toLowerCase() || '';
  const filterQuery = searchParams.get('filter')?.toLowerCase();

  const filteredJobs: Job[] = jobs.filter((job) => {
    const jobTitle = job.job_title.toLowerCase();
    const jobEmploymentType = job.job_employment_type.toLowerCase();
    const jobDescription = job.job_description.toLowerCase();
    const jobCountry = job.job_country.toLowerCase();

    // Match against search query
    const matchesSearch =
      jobTitle.includes(searchQuery) ||
      jobEmploymentType.includes(searchQuery) ||
      jobDescription.includes(searchQuery);

    // Match against filter query
    const matchesFilter = filterQuery ? jobCountry.includes(filterQuery) : true;

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const result = await response.json();

        const countriesFilters = result
          .map((country: any) => ({
            name: country.name.common,
            value: country.cca2.toLowerCase(),
            flagSvg: country.flags.svg,
          }))
          .sort((a: any, b: any) => {
            // Compare the names in alphabetical order
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          });

        setCountries(countriesFilters);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCountries();
  }, []);

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">
        Jobs | {filterQuery?.toUpperCase()}
      </h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/jobs"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Job Title or Keywords"
          otherClasses="flex-1"
        />

        <Filter
          filters={countries}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          placeholder="Select a Location"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => <JobCard key={index} job={job} />)
        ) : (
          <p>No job listings available.</p>
        )}
      </div>

      <div className="mt-10">
        <Pagination pageNumber={pageNumber} isNext={pageNumber < totalPages} />
      </div>
    </>
  );
}

export default Jobs;
