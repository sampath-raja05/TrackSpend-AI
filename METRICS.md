# Metrics

The North Star metric is qualified savings dollars captured per week: the sum of monthly savings identified in audits where the user shares an email or books a consultation. This matches the job of the product better than DAU because most teams will not use an AI spend audit every day. A one-time user with a real $1,000/month savings opportunity is more valuable than many casual visits.

Three input metrics drive it. First, audit completion rate from landing page visit to generated report. Second, qualified savings rate: the percentage of completed audits with more than $100/month in defensible savings. Third, post-report capture rate: the percentage of users who enter email after seeing the report.

I would instrument page view, step completion, audit created, result viewed, email captured, high-savings CTA clicked, and consultation requested. Events should include anonymous audit ID, savings bucket, tool count, team-size bucket, and use case, but not email in analytics.

A pivot trigger: if 300 completed audits produce fewer than 15 captured leads or fewer than 3 high-savings conversations, the product is either finding too little pain or asking for contact at the wrong moment. If audit completion is below 20%, the input flow is too heavy and needs simplification before changing channels.
