# SmartCommute
Software Engineering course project in LM Automation &amp; Control engineering, Politecnico di Milano. Based on project proposal: TRAVLENDAR

## Requirements:
- Authentication System
- Calendar interface
- Automatically compute the travel time between appointments
(+ Warn for time overlapping)
- Travel means by appointment and by day
- User customizable
- Variability time between appointments

## Development tools:
- jQuery (library for cross-browser compatibility, not good for building scalable web apps)
- Bootstrap
- Package manager: npm
- Install node.js
- Install gulp (to run project on localhost)
- Open a firebase project to use authentication + realtime database
- Use Atom / Visual Studio Code
- Version control - git with command lines / GUI software
- Unit testing - jest (jestjs.io)
- Docsify (documentation)

## Pages:
- Calendar Page (home)
  - Daily view
    - Schedules (markers)
- Roadmap
  - Travel time between schedules (edges)
  - Transport means (color of edges)
  - Markers / lines / line color on the map
  - Durations by marker / edge
- Profile
  - User preferences
    - Activate/Deactivate each travel means globally
    - Time/Distance constraints for travel means
    - Type of user specification
    - Personal transport means and its constraints (like shared car)
  - Settings
    - Notifications
    - Overlay
- Create event (appointment)
  - User inputs:
    - Title
    - Address
    - Start Time
    - End Time
    - Description
  - User journey:
    - Journey parameters
    - Transportation cost (optional)
    - Weather forecast (optional)
    - Fill in form → Validate → Click Submit → Check travel time feasibility → Save / Warn / Throw error
  
