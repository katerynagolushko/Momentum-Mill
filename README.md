# Momentum Mill Website

A modern, animated website for Momentum Mill - helping founders gain momentum through strategic fundraising, partnerships, and recognition in the startup ecosystem.

## 🎨 Brand Colors

- **Dark Espresso**: `#2B221D`
- **Warm Gold**: `#D69946`

## 🚀 Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## 📦 Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The site will be available at [http://localhost:5173/](http://localhost:5173/)

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
momentum-mill/
├── src/
│   ├── components/
│   │   ├── Logo.jsx           # Animated mill logo with rotating wheel
│   │   └── ServiceCard.jsx    # Reusable service card component
│   ├── App.jsx                # Main application component
│   ├── index.css              # Global styles with Tailwind
│   └── main.jsx               # Application entry point
├── public/                    # Static assets
├── index.html                 # HTML template
├── tailwind.config.js         # Tailwind configuration
└── package.json              # Dependencies and scripts
```

## ✏️ Customization

### Update About Section

Edit the about section in `src/App.jsx` around line 107 to update Kateryna's bio and information.

### Modify Services

The service tracks (Fundraising and Partnerships) can be customized by editing the `fundraisingItems` and `partnershipsItems` arrays in `src/App.jsx`.

### Adjust Colors

Additional color schemes can be added in `tailwind.config.js` under the `extend.colors` section.

### Logo Animation

The mill wheel animation speed can be adjusted in `src/components/Logo.jsx` by changing the `duration` value in the motion component (currently set to 8 seconds).

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Vercel will auto-detect Vite and configure the build settings
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Create a new site in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

### Custom Domain

Once deployed, you can connect your `momentummill` domain through your hosting provider's domain settings.

## 📱 Features

- ✅ Fully responsive design
- ✅ Smooth scroll animations
- ✅ Animated mill wheel logo
- ✅ Modern gradient backgrounds
- ✅ Hover effects and transitions
- ✅ Two service tracks (Fundraising & Partnerships)
- ✅ About section with external link
- ✅ Clean, professional footer

## 🛠 Future Enhancements

- Add contact form
- Include testimonials section
- Add case studies or success stories
- Integrate analytics
- Add blog or resources section
- Create detailed service pages

---

Built with ❤️ for Momentum Mill
