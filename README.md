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
- Materialize https://materializecss.com/
- Package manager: npm
- Install node.js
- Install gulp (to run project on localhost)
- Open a firebase project to use authentication + realtime database
- Use Atom / Visual Studio Code
- Version control - git with command lines / GUI software
- Unit testing - Karma / Jasmine (to test function by function)
- GitHub repo - enable GitHub Pages e.g. https://fionnachan.github.io/Timer/static/
- Docsify (documentation)

## Pages: 
- Calendar Page (home)
    Daily calendar
        Schedules (markers)
- Travel time between schedules (edges)
- Transport means (color of edges)
- Overview (map)
    Markers / lines / line color on the map
    Durations by marker / edge
- Profile
    User preferences
        Activate/Deactivate each travel means globally
        Time/Distance constraints for travel means
        Type of user specification
        Personal transport means and its constraints (like shared car)
    Settings
        Notifications
        Overlay
- Create Routine (Additional)
    User inputs:
        Frequency
        Time
        Duration  
        Recurrence (Temporary/Permanent)
        Type/Description
- Create meeting
    User inputs:
        Location
        Time
        Duration
    User journey:
        Journey parameters
            Transportation cost
            Weather forecast
        Fill in form → Validate → Click Submit → Check travel time feasibility → Save / Warn

