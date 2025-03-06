import React from 'react';

function Tribute() {
  return (
    <div className="max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold mb-8" style={{ color: '#1e044a' }}>Tribute</h1>

      <div className="prose prose-lg">
      <p className="text-black text-xl font-bold mb-6">
          Our beloved Head of Department was more than just a leader; they were a mentor, 
          friend, and inspiration to all who had the privilege of working with them.
        </p>
        <h2 className="text-3xl font-bold mb-8" style={{ color: '#1e044a' }}>Biography</h2>
        <p className="text-black text-xl font-bold mb-6">
          With over two decades of dedicated service in academia, they shaped the lives 
          of countless students and colleagues. Their commitment to excellence and 
          innovative teaching methods set new standards in our department.
        </p>
        <h2 className="text-3xl font-bold mb-8" style={{ color: '#1e044a' }}>Legacy</h2>
        <p className="text-black text-xl font-bold mb-6">
          Their legacy lives on through the numerous initiatives they started, the 
          research programs they established, and most importantly, through the lives 
          they touched and the minds they inspired.
        </p>
      </div>
    </div>
  );
}

export default Tribute;