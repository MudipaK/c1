const GoogleSendMail = require('./sendEmail');

/**
 * Send notification emails to organization president and staff advisor about a new event
 * @param {Object} organization - The organization with populated president and staffAdvisor
 * @param {Object} event - The newly created event
 */
const sendEventCreationNotifications = async (organization, event) => {
  try {
    const { 
      name: organizationName, 
      president, 
      staffAdvisor 
    } = organization;
    
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5000/login';
    const eventReviewUrl = `${loginUrl}/events/review/${event._id}`;
    
    // Format date for better readability
    const eventDate = new Date(event.eventDate).toLocaleDateString();
    
    // Send email to the President
    await GoogleSendMail({
      email: president.email,
      subject: `New Event Created: ${event.eventName} for ${organizationName}`,
      template: 'eventPresidentNotification.ejs',
      data: {
        name: president.username,
        organizationName,
        eventName: event.eventName,
        eventDate,
        eventStartTime: event.eventStartTime,
        eventFinishTime: event.eventFinishTime,
        timePeriod: event.timePeriod,
        eventPresident: event.eventPresident,
        eventMode: event.eventMode,
        eventType: event.eventType,
        eventVenue: event.eventVenue,
        loginUrl
      }
    });
    
    // Send email to the Staff Advisor
    await GoogleSendMail({
      email: staffAdvisor.email,
      subject: `ACTION REQUIRED: New Event Approval - ${event.eventName} for ${organizationName}`,
      template: 'eventStaffAdvisorNotification.ejs',
      data: {
        name: staffAdvisor.username,
        organizationName,
        eventName: event.eventName,
        eventDate,
        eventStartTime: event.eventStartTime,
        eventFinishTime: event.eventFinishTime,
        timePeriod: event.timePeriod,
        eventPresident: event.eventPresident,
        eventMode: event.eventMode,
        eventType: event.eventType,
        eventVenue: event.eventVenue,
        presidentName: president.username,
        eventReviewUrl
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error sending event creation notifications:', error);
    return false;
  }
};

/**
 * Send notification emails about event updates to organization president and staff advisor
 * @param {Object} organization - The organization with populated president and staffAdvisor
 * @param {Object} event - The updated event
 * @param {Array} changedFields - Array of changed field objects with field, oldValue, and newValue
 */
const sendEventUpdateNotifications = async (organization, event, changedFields) => {
  try {
    const {
      name: organizationName,
      president,
      staffAdvisor
    } = organization;
    
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5000/login';
    const eventDetailsUrl = `${loginUrl}/events/${event._id}`;
    
    // Format date for better readability
    const eventDate = new Date(event.eventDate).toLocaleDateString();
    
    // Send email to the President
    if (president && president.email) {
      await GoogleSendMail({
        email: president.email,
        subject: `Event Updated: ${event.eventName} for ${organizationName}`,
        template: 'eventUpdateNotification.ejs',
        data: {
          recipientName: president.username,
          organizationName,
          eventName: event.eventName,
          eventDate,
          eventStartTime: event.eventStartTime,
          eventFinishTime: event.eventFinishTime,
          eventMode: event.eventMode,
          eventType: event.eventType,
          eventStatus: event.eventStatus,
          eventVenue: event.eventVenue,
          changedFields,
          dashboardUrl: `${loginUrl}/organization/events`,
          eventDetailsUrl
        }
      });
    }
    
    // Send email to the Staff Advisor
    if (staffAdvisor && staffAdvisor.email) {
      await GoogleSendMail({
        email: staffAdvisor.email,
        subject: `Event Updated: ${event.eventName} for ${organizationName}`,
        template: 'eventUpdateNotification.ejs',
        data: {
          recipientName: staffAdvisor.username,
          organizationName,
          eventName: event.eventName,
          eventDate,
          eventStartTime: event.eventStartTime,
          eventFinishTime: event.eventFinishTime,
          eventMode: event.eventMode,
          eventType: event.eventType,
          eventStatus: event.eventStatus,
          eventVenue: event.eventVenue,
          changedFields,
          dashboardUrl: `${loginUrl}/staff-advisor/events`,
          eventDetailsUrl
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error sending event update notifications:', error);
    return false;
  }
};

/**
 * Send notification emails about event status changes to organization president and staff advisor
 * @param {Object} organization - The organization with populated president and staffAdvisor
 * @param {Object} event - The event with updated status
 * @param {String} oldStatus - Previous event status
 * @param {String} newStatus - New event status
 */
const sendEventStatusUpdateNotification = async (organization, event, oldStatus, newStatus) => {
  try {
    const {
      name: organizationName,
      president,
      staffAdvisor
    } = organization;
    
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5000/login';
    const eventDetailsUrl = `${loginUrl}/events/${event._id}`;
    
    // Format date for better readability
    const eventDate = new Date(event.eventDate).toLocaleDateString();
    
    // Style variables based on new status for the template
    let headerColor, highlightColor, buttonColor, statusBgColor, statusTextColor;
    
    if (newStatus === 'Approved') {
      headerColor = '#2e7d32'; // Green
      highlightColor = '#2e7d32';
      buttonColor = '#2e7d32';
      statusBgColor = '#e8f5e9';
      statusTextColor = '#2e7d32';
    } else if (newStatus === 'Rejected') {
      headerColor = '#c62828'; // Red
      highlightColor = '#c62828';
      buttonColor = '#c62828';
      statusBgColor = '#ffebee';
      statusTextColor = '#c62828';
    } else {
      headerColor = '#f57c00'; // Orange for pending
      highlightColor = '#f57c00';
      buttonColor = '#f57c00';
      statusBgColor = '#fff3e0';
      statusTextColor = '#f57c00';
    }
    
    // Common template data
    const commonData = {
      organizationName,
      eventName: event.eventName,
      eventDate,
      eventStartTime: event.eventStartTime,
      eventFinishTime: event.eventFinishTime,
      eventMode: event.eventMode,
      eventType: event.eventType,
      eventVenue: event.eventVenue,
      oldStatus,
      newStatus,
      headerColor,
      highlightColor,
      buttonColor,
      statusBgColor,
      statusTextColor,
      eventDetailsUrl
    };
    
    // Send email to the President
    if (president && president.email) {
      await GoogleSendMail({
        email: president.email,
        subject: `Event Status Updated: ${event.eventName} - ${newStatus}`,
        template: 'eventStatusUpdateNotification.ejs',
        data: {
          ...commonData,
          recipientName: president.username,
          dashboardUrl: `${loginUrl}/organization/events`
        }
      });
    }
    
    // Send email to the Staff Advisor, if they weren't the one making the change
    if (staffAdvisor && staffAdvisor.email) {
      await GoogleSendMail({
        email: staffAdvisor.email,
        subject: `Event Status Updated: ${event.eventName} - ${newStatus}`,
        template: 'eventStatusUpdateNotification.ejs',
        data: {
          ...commonData,
          recipientName: staffAdvisor.username,
          dashboardUrl: `${loginUrl}/staff-advisor/events`
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error sending event status update notifications:', error);
    return false;
  }
};

module.exports = {
  sendEventCreationNotifications,
  sendEventUpdateNotifications,
  sendEventStatusUpdateNotification
};