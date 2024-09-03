import React from 'react';
import PopularSources from './popular';
import Graph from './graph';
import Cards from './cards';
import ConvoGraph from './convograph';

const Admin = () => {
  return (
    <div>
      <Cards />
      <div className="flex md:flex-row flex-col p-2 gap-2">
        <div className="md:w-1/2">
          {/* <Graph /> */}
        </div>
        <div className="md:w-1/2">
          {/* <PopularSources /> */}
        </div>
      </div>
      <div className='mb-10 p-4 bg-white rounded-md'>
        <ConvoGraph />
      </div>
    </div>
  );
};

export default Admin;
