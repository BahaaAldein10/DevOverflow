'use client';

import JobCard from '@/components/cards/JobCard';
import Filter from '@/components/shared/Filter';
import LocalSearchbar from '@/components/shared/LocalSearchbar';
import Pagination from '@/components/shared/Pagination';
import { useSearchParams } from 'next/navigation';
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

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const searchParams = useSearchParams();
  const pageNumber = Number(searchParams.get('page')) || 1;
  const pageSize = 5;

  // 1. Fetch jobs once pageNumber changes
  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/search`
        );
        const data = await res.json();
        const start = (pageNumber - 1) * pageSize;
        const sliced = data.result.slice(start, start + pageSize);
        setJobs(sliced);
        setTotalPages(Math.ceil(data.totalItems / pageSize));
      } catch (err) {
        console.error(err);
      }
    }
    fetchJobs();
  }, [pageNumber]);

  // 2. Fetch country list once filterQuery changes
  const filterQuery = searchParams.get('filter')?.toLowerCase() || '';

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,cca2,flags'
        );
        const list = await res.json();

        const mapped: Country[] = list
          .map((c: any) => ({
            name: c.name.common,
            value: c.cca2.toLowerCase(),
            flagSvg: c.flags.svg,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        setCountries(mapped);

        // Safely find the full country name for this code
        const matched = mapped.find((c) => c.value === filterQuery);
        setSelectedCountry(matched ? matched.name : '');
      } catch (err) {
        console.error(err);
      }
    }
    fetchCountries();
  }, [filterQuery]);

  // 3. Apply search + country-name filter
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';
  const filteredJobs = jobs.filter((job) => {
    const title = job.job_title.toLowerCase();
    const desc = job.job_description.toLowerCase();
    const type = job.job_employment_type.toLowerCase();
    const countryName = job.job_country.toLowerCase();

    const matchesSearch =
      title.includes(searchQuery) ||
      desc.includes(searchQuery) ||
      type.includes(searchQuery);

    const matchesCountry = filterQuery
      ? countryName === selectedCountry.toLowerCase()
      : true;

    return matchesSearch && matchesCountry;
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">
        Jobs{filterQuery && ` | ${filterQuery.toUpperCase()}`}
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
          filteredJobs.map((job, i) => <JobCard key={i} job={job} />)
        ) : (
          <p className="text-dark200_light900">
            No job listings available
            {selectedCountry && ` for ${selectedCountry}`}.
          </p>
        )}
      </div>

      {filteredJobs.length > 0 && (
        <div className="mt-10">
          <Pagination
            pageNumber={pageNumber}
            isNext={pageNumber < totalPages}
          />
        </div>
      )}
    </>
  );
}
