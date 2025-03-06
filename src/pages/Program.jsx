import React from 'react';

function Program() {
  const schedule = [
    {
      time: '9:00 AM',
      event: 'Memorial Service',
      location: 'University Main Auditorium'
    },
    {
      time: '10:30 AM',
      event: 'Tributes from Colleagues and Students',
      location: 'University Main Auditorium'
    },
    {
      time: '12:00 PM',
      event: 'Photo Montage and Video Tribute',
      location: 'University Main Auditorium'
    },
    {
      time: '2:00 PM',
      event: 'Procession to Final Resting Place',
      location: 'Memorial Gardens'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Memorial Program</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {schedule.map((item, index) => (
          <div 
            key={index}
            className={`p-6 ${
              index !== schedule.length - 1 ? 'border-b border-gray-200' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.event}</h3>
                <p className="text-gray-600">{item.location}</p>
              </div>
              <span className="text-indigo-600 font-medium">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Program;