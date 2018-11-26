var events = function() { //must load from firebase DB all the events of the current user!
  return [{
  id: 1,
  title: "Well, you said you wanted to be around when I made a mistake.",
  description: 'description for Birthday Part22w2w21w21w2w',
  start: "2018-11-04T14:30:00.000Z",
  end: "2018-11-06T18:30:00.000Z"
  },

  {
  id: 2,
  title: "Lunch Time",
  description: 'description for Birthday Party',
  start: '13:00',
  end: '14:00',
  backgroundColor:'#FFD700',
  dow:[0,1,2,3,4,5,6]
  },

  {
  id: 3,
  title: "4days-20-23",
  description: 'Rome Travel',
  start: "2018-11-20T09:00:00.000Z",
  end: "2018-11-23T18:25:00.000Z",
  dow:[0,1,2,3,4,5,6]
  }];
};
//returns an array of the form: [{eventData}, {eventData2}, ...];