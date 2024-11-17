# New Smile of Compassion Site
Link to deployed site: [https://smileofcompassion.com](https://smileofcompassion.com)

New redesigned site for Smile of Compassion Projects using React and Hygraph as a CMS.

## Features:
- Uses Hygraph CMS to allow admin to add posts by entering data in a user-friendly interface, no code involved.
- All added pages on Hygraph will be appended to main site immediately.
- Language switcher is setup for local translations on non-dynamic pages but dynamic pages is done through Hygraph locales (currently EN and VN).
- Uses emailJS for contact form backend.
- Fetches Facebook posts through Meta API and pipes data through to Hygraph using Hygraph API.
- In admin panel for empty locales where the other locale is present, uses free Gemini API to translate and fill field.

## Roadmap:

**Current Progess:**

![](https://geps.dev/progress/95)



**Current Task:** Content migration

- [x] Skeleton site.
- [x] Logos and backgrounds.
- [x] Hygraph integration. 
- [x] Github progress host.
- [x] Contact form backend.
- [x] Full stylization.
- [x] Donations. - To add Credit/Debit option
- [ ] Admin portal linked to Hygraph for an easier admin experience. - WIP
- [ ] Facebook post import to hygraph on admin portal using Meta API.
- [ ] AI translations using OPENAI-API for unfilled locale in admin panel.

(Please note this is a work in progress and not all the content is migrated yet and some features may not work. This is by no means what the final site will look like but just a skeleton in progress. All styles are placeholders and will change. The site is not responsive at this point and is only intended to show the current progress and functionality.)
