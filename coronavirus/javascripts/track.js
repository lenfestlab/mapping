function track(eventName, eventCategory, eventLabel='', cd1='', cd2='', cd3='', non_interaction=false) {
  console.log(eventName, eventCategory, eventLabel, cd1)
  gtag('event', eventName, {
    'event_category' : eventCategory,
    'event_label' : eventLabel,
    'cd1': cd1,
    'cd2': cd2,
    'cd3': cd3,
    'non_interaction': non_interaction
  });  
}

function trackVaccineResourceTool() {
  track('vaccine-resource',	'navigation',	'vaccine lookup tool')
}

function trackVaccineResourceInfo() {
  track('vaccine-resource',	'navigation',	'faq')
}

function trackSignupClick() {
  track('signup-click', 'registration',	"Sign up")
}

function trackPastArticles(countyName) {
  track('past-articles',	'navigation', countyName)
}

function trackConfirmation() {
  selectedCounties = []
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  for (var checkbox of checkboxes) {
    selectedCounties.push(checkbox.getAttribute("data"));
  }
  track('confirmation',	'registration',	selectedCounties.join(", "))
}

function subscriptionViewed(selectedCounties) {
  track('subscription-viewed',	'registration',	selectedCounties)
}

function trackSample(link) {
  track('sample',	'registration', link)
}

function trackResubscribe() {
  track('resubscribe',	'registration',	"here")
}

function trackManageSubscription() {
  selectedCounties = []
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  for (var checkbox of checkboxes) {
    selectedCounties.push(checkbox.getAttribute("data"));
  }
  track('manage-subscription',	'registration',	selectedCounties.join(", "))
}