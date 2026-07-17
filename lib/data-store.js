const globalStore = globalThis.__appDataStore ??= {
  users: [],
  novels: [],
  userCounter: 0,
  novelCounter: 0,
};

function ensureSeededNovels() {
  if (globalStore.novels.length > 0) {
    return globalStore.novels;
  }

  globalStore.novels = [
    {
      id: 1,
      title: 'ดาบมังกรหยก',
      author: 'Jin Yong',
      genre: 'แฟนตาซี',
      description: 'นิยายกำลังภายในยอดนิยม',
      rating: 4.8,
      image: '/homepage.html',
    },
    {
      id: 2,
      title: 'The Starfall Chronicles',
      author: 'Mina S.',
      genre: 'แฟนตาซี',
      description: 'โลกที่ดาวตกและกฎแห่งจักรวาล',
      rating: 4.9,
      image: '/homepage.html',
    },
  ];
  globalStore.novelCounter = globalStore.novels.length;
  return globalStore.novels;
}

export function findUserByEmail(email) {
  return globalStore.users.find((user) => user.email === email);
}

export function findUserByEmailOrUsername(email, username) {
  return globalStore.users.find(
    (user) => user.email === email || user.username === username
  );
}

export function saveUser(user) {
  globalStore.users.push(user);
  return user;
}

export function getNovels() {
  return ensureSeededNovels();
}

export function getNovelById(id) {
  const novelId = Number(id);
  return getNovels().find((novel) => novel.id === novelId) || null;
}

export function createNovel(data) {
  const novel = {
    id: ++globalStore.novelCounter,
    title: data.title,
    author: data.author,
    genre: data.genre,
    description: data.description,
    rating: Number(data.rating || 0),
    image: data.image || null,
  };

  globalStore.novels.unshift(novel);
  return novel;
}

export function updateNovel(id, data) {
  const novelId = Number(id);
  const index = globalStore.novels.findIndex((novel) => novel.id === novelId);

  if (index === -1) {
    return null;
  }

  globalStore.novels[index] = {
    ...globalStore.novels[index],
    ...data,
    rating: Number(data.rating || globalStore.novels[index].rating),
    image: data.image ?? globalStore.novels[index].image,
  };

  return globalStore.novels[index];
}

export function deleteNovel(id) {
  const novelId = Number(id);
  const index = globalStore.novels.findIndex((novel) => novel.id === novelId);

  if (index === -1) {
    return false;
  }

  globalStore.novels.splice(index, 1);
  return true;
}

export function seedNovels() {
  return ensureSeededNovels();
}
