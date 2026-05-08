# Metrics

The North Star metric is **qualified savings pipeline generated per week**: the total estimated monthly savings identified from audits where the user either shares their email or books a consultation. This aligns with the actual purpose of the product better than metrics like DAU because TrackSpend AI is not a daily-use tool. A single founder discovering a legitimate $800/month optimization opportunity is significantly more valuable than hundreds of low-intent visits.

Three input metrics drive this North Star metric.

First is **audit completion rate**, measured from audit start to generated report. This validates whether the onboarding flow is simple enough and whether users understand the value proposition quickly.

Second is **qualified audit rate**: the percentage of completed audits that identify more than $100/month in realistic savings opportunities. This measures whether the recommendation engine is finding meaningful financial inefficiencies rather than generic suggestions.

Third is **post-report conversion rate**: the percentage of users who submit their email or request a consultation after viewing their audit results. This is the strongest signal of trust and genuine buying intent.

The first instrumentation events I would track are:
- landing page viewed,
- audit started,
- step completion,
- audit completed,
- results viewed,
- email submitted,
- consultation requested,
- and recommendation interaction.

Each event should include:
- anonymous audit ID,
- savings range,
- team-size bucket,
- number of AI tools,
- and primary use case,

while intentionally avoiding storing personal data inside analytics events.

A pivot trigger would be:
- fewer than 15 captured leads from 300 completed audits,
- or fewer than 3 consultation requests from high-savings audits.

That would suggest either:
- the pain point is not strong enough,
- the recommendations are not trusted,
- or the product is asking for contact information too early.

Additionally, if audit completion drops below 20%, the onboarding flow is too heavy and should be simplified before experimenting with new acquisition channels.