const GoogleSendMail = require('./sendEmail');

/**
 * Send notification emails to both the president and staff advisor of a newly created club
 * @param {Object} organizationData - Contains club info and user details
 */
const sendClubCreationNotifications = async (organizationData) => {
  try {
    const { 
      name: organizationName, 
      president, 
      staffAdvisor 
    } = organizationData;
    
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173/login';
    
    // Send email to the President
    await GoogleSendMail({
      email: president.email,
      subject: `You've Been Appointed as President of ${organizationName}`,
      template: 'clubPresidentNotification.ejs',
      data: {
        name: president.username,
        organizationName,
        advisorName: staffAdvisor.username,
        loginUrl
      }
    });
    
    // Send email to the Staff Advisor
    await GoogleSendMail({
      email: staffAdvisor.email,
      subject: `Staff Advisory Role for ${organizationName}`,
      template: 'clubAdvisorNotification.ejs',
      data: {
        name: staffAdvisor.username,
        organizationName,
        presidentName: president.username,
        loginUrl
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error sending club creation notifications:', error);
    return false;
  }
};

/**
 * Send notification emails when an organization is updated
 * @param {Object} organization - The updated organization with populated fields
 * @param {Array} changes - List of changes made to the organization
 */
const sendOrganizationUpdateNotifications = async (organization, changes = []) => {
  try {
    const { 
      name: organizationName, 
      president, 
      staffAdvisor 
    } = organization;
    
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173/login';
    const recipients = [president, staffAdvisor].filter(Boolean);
    
    const sendPromises = recipients.map(recipient => {
      return GoogleSendMail({
        email: recipient.email,
        subject: `Organization Update: ${organizationName}`,
        template: 'organizationUpdateNotification.ejs',
        data: {
          name: recipient.username,
          organizationName,
          changes,
          loginUrl
        }
      });
    });
    
    await Promise.all(sendPromises);
    return true;
  } catch (error) {
    console.error('Error sending organization update notifications:', error);
    return false;
  }
};

/**
 * Send notification emails when an organization is deleted
 * @param {Object} organization - The deleted organization data
 */
const sendOrganizationDeletionNotifications = async (organization) => {
  try {
    const { 
      name: organizationName, 
      president, 
      staffAdvisor 
    } = organization;
    
    const contactUrl = process.env.CONTACT_URL || 'http://localhost:5173/contact';
    const recipients = [president, staffAdvisor].filter(Boolean);
    
    const sendPromises = recipients.map(recipient => {
      return GoogleSendMail({
        email: recipient.email,
        subject: `Important: Organization Deleted - ${organizationName}`,
        template: 'organizationDeletionNotification.ejs',
        data: {
          name: recipient.username,
          organizationName,
          contactUrl
        }
      });
    });
    
    await Promise.all(sendPromises);
    return true;
  } catch (error) {
    console.error('Error sending organization deletion notifications:', error);
    return false;
  }
};

/**
 * Send notification emails when an event is deleted
 * @param {Object} organization - The organization with populated president and staffAdvisor
 * @param {Object} deletedEvent - The event that was deleted
 * @param {String} oldStatus - The status before deletion
 * @param {String} deletedByName - Optional name of the user who deleted the event
 */
const sendEventDeletionNotification = async (organization, deletedEvent, oldStatus, deletedByName = null) => {
  try {
    const {
      name: organizationName,
      president,
      staffAdvisor
    } = organization;
    
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5000/login';
    
    // Format date for better readability
    const eventDate = new Date(deletedEvent.eventDate).toLocaleDateString();
    
    // Style variables for the template (using red for deletion)
    const headerColor = '#c62828';
    const highlightColor = '#c62828';
    const buttonColor = '#c62828';
    const statusBgColor = '#ffebee';
    const statusTextColor = '#c62828';
    
    // Common template data
    const commonData = {
      organizationName,
      eventName: deletedEvent.eventName,
      eventDate,
      eventStartTime: deletedEvent.eventStartTime,
      eventFinishTime: deletedEvent.eventFinishTime,
      eventMode: deletedEvent.eventMode,
      eventType: deletedEvent.eventType,
      previousStatus: oldStatus,
      deletedBy: deletedByName,
      deletedAt: new Date().toLocaleString(),
      headerColor,
      highlightColor,
      buttonColor,
      statusBgColor,
      statusTextColor,
    };
    
    // Send email to the President
    if (president && president.email) {
      await GoogleSendMail({
        email: president.email,
        subject: `Event Deleted: ${deletedEvent.eventName} for ${organizationName}`,
        template: 'eventDeletionNotification.ejs',
        data: {
          ...commonData,
          recipientName: president.username,
          dashboardUrl: `${loginUrl}/organization/events`
        }
      });
    }
    
    // Send email to the Staff Advisor
    if (staffAdvisor && staffAdvisor.email) {
      await GoogleSendMail({
        email: staffAdvisor.email,
        subject: `Event Deleted: ${deletedEvent.eventName} for ${organizationName}`,
        template: 'eventDeletionNotification.ejs',
        data: {
          ...commonData,
          recipientName: staffAdvisor.username,
          dashboardUrl: `${loginUrl}/staff-advisor/events`
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error sending event deletion notifications:', error);
    return false;
  }
};

module.exports = {
  sendClubCreationNotifications,
  sendOrganizationUpdateNotifications,
  sendOrganizationDeletionNotifications,
  sendEventDeletionNotification
};