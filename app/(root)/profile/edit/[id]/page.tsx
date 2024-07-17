import Profile from '@/components/forms/Profile';
import { getUserById } from '@/lib/actions/user.action';
import { ParamsProps } from '@/types';

async function Page({ params }: ParamsProps) {
  const user = await getUserById({ userId: params.id });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <Profile mongoUser={JSON.stringify(user)} />;
    </>
  );
}

export default Page;
