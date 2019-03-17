# SmartCommute
Smart Commute is a simple interface for commute-aware event scheduling. Considers the event travel times from your location and maps them, along with their routes, creating a roadmap with all your day events and the commuting time. In short, a lightweight assistant only focused on getting on time for your daily errands.

Currently in development, constantly improving.

## Development tools:
- jQuery + fullcalendar 
- Bootstrap
- node.js, npm, gulp
- Firebase Auth + Firebase Database
- HERE maps API (geocoder, router and autocomplete)

## Overview:
- Calendar
  - Day, Week, Month calendar (shows events)
  
![calendar](https://user-images.githubusercontent.com/34441138/54401089-5977c080-46c6-11e9-93d6-5096e660d582.jpg)

- Event creation / modification
  - User inputs title, location, start and end times and description of the event

![newevent](https://user-images.githubusercontent.com/34441138/54401608-9d6bc500-46c8-11e9-93b2-322ee01dff62.jpg)
![editevent](https://user-images.githubusercontent.com/34441138/54401696-f3d90380-46c8-11e9-83bf-011e65499be3.jpg)
Algorithm prevents event overlapping, wrong time input, empty title and evaluates the travel time between appointments to define whether the event can be added or not! 

- Roadmap
  - Markers for events
  - Travel times for polylines
  - Popups revealing each event information
  
![roadmap](https://user-images.githubusercontent.com/34441138/54401059-259c9b00-46c6-11e9-8796-ab9fd6d09141.jpg)

- Settings
  - Activate/Deactivate each travel means globally
  - Time/Distance constraints for travel means - not yet implemented

![settings](https://user-images.githubusercontent.com/34441138/54401168-d440db80-46c6-11e9-8d03-01fa0860a157.jpg)

- Create Routine (Additional) - not yet implemented
  - Frequency
  - Time
  - Duration  
  - Recurrence (Temporary/Permanent)
  - Type/Description
    
# About
Initially developed by Antonio Del Negro and Pavel Pascacio, for the Software Engineering course in the Automation & Control engineering Master, Politecnico di Milano, Italy. Based on project proposal: TRAVLENDAR
