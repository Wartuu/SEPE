const { CONFIG } = require('./config');
const {
  addChatUser,
  getChatUserByGit,
  updateChatUser,
  getUserEmoji,
} = require('./database');

async function getGroups(token) {
  let groups = await fetch(`${CONFIG.GITLAB_URL}/api/v4/groups`, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });

  var userGroups = await groups.json();
  return userGroups;
}

async function isAdmin(user, token) {
  var groups = await getGroups(token);

  for (let i = 0; i < groups.length; i++) {
    if (groups[i].id == CONFIG.ADMIN_GROUP_ID) {
      return true;
    }
  }

  return false;
}

async function isFullTime(id) {
  var request = await fetch(
    `${CONFIG.GITLAB_URL}/api/v4/groups/62/members/${id}`,
    {
      headers: {
        Authorization: 'Bearer ' + CONFIG.PERSONAL_TOKEN,
      },
    },
  );

  let response = await request.json();

  if (response.message === '404 Not found') {
    return false;
  } else {
    return response.id === id;
  }
}

async function verifyUser(token) {
  if (token === undefined) {
    console.log('undefined token');
    return undefined;
  }
  const user = await fetch(
    CONFIG.GITLAB_URL + '/api/v4/user?access_token=' + token,
  );
  var userData = await user.json();

  userData.emoji = await getUserEmoji(userData.id);
  return userData;
}

async function getUsers() {
  let allUsers = [];

  let nextPage = true;
  let pageNumber = 1;
  while (nextPage) {
    let users = await fetch(
      CONFIG.GITLAB_URL +
        '/api/v4/users?per_page=100&active=true&humans=true&page=' +
        pageNumber,
      {
        headers: {
          Authorization: 'Bearer ' + CONFIG.PERSONAL_TOKEN,
        },
      },
    );
    let usersJson = await users.json();

    if (usersJson.length != 0) {
      allUsers.push(...usersJson);
    } else {
      nextPage = false;
    }

    pageNumber++;
  }

  return allUsers.reverse();
}

async function getChatUsers() {
  let allUsers = [];
  let nextPage = true;
  let offset = 0;
  const count = 50;

  while (nextPage) {
    const response = await fetch(
      `${CONFIG.GITLAB_URL}/api/v1/users.list?offset=${offset}&count=${count}`,
      {
        method: 'GET',
        headers: {
          'X-Auth-Token': CONFIG.CHAT_TOKEN,
          'X-User-Id': CONFIG.CHAT_USERID,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching users: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      if (data.users.length > 0) {
        allUsers.push(...data.users);
        offset += count;
      } else {
        nextPage = false;
      }
    } else {
      throw new Error(`API Error: ${data.error}`);
    }
  }

  return allUsers.reverse();
}

async function getChatUserByEmail(email) {
  const users = await getChatUsers();

  for (const user of users) {
    if (Array.isArray(user.emails)) {
      for (const emailObj of user.emails) {
        if (emailObj.address === email) {
          return user;
        }
      }
    }
  }

  return null;
}

async function getUser(id) {
  let request = await fetch(CONFIG.GITLAB_URL + '/api/v4/users/' + id, {
    headers: {
      Authorization: 'Bearer ' + CONFIG.PERSONAL_TOKEN,
    },
  });

  let userOut = await request.json();
  return userOut;
}

async function getUserRepositories(id) {
  let request = await fetch(
    `${CONFIG.GITLAB_URL}/api/v4/users/${id}/projects`,
    {
      headers: {
        Authorization: 'Bearer ' + CONFIG.PERSONAL_TOKEN,
      },
    },
  );

  return await request.json();
}

async function getUserCommitsByDate(id, date) {
  const today = new Date(date);

  let start = today;
  let end = new Date(start.getTime() + 86400000);
  start = start.toISOString().split('T')[0];
  end = end.toISOString().split('T')[0];

  console.log(start);
  console.log(end);

  let repositories = await getUserRepositories(id);
  let commits = [];

  for (let repo of repositories) {
    const request = await fetch(
      `${CONFIG.GITLAB_URL}/api/v4/projects/${repo.id}/repository/commits?author_id=${id}&since=${start}&until=${end}`,
      {
        headers: {
          Authorization: 'Bearer ' + CONFIG.PERSONAL_TOKEN,
        },
      },
    );

    const repoCommits = await request.json();

    const updatedCommits = repoCommits.map((commit) => ({
      ...commit,
      repository: repo.name,
      repository_url: repo.web_url,
    }));

    commits = commits.concat(updatedCommits);
  }

  return commits;
}

async function linkRocketChat(id, email) {
  if (!CONFIG.CHAT_TOKEN) {
    return false;
  }

  let chatUser = await getChatUserByEmail(email);
  let existingUser = await getChatUserByGit(id);

  if (chatUser == null) {
    console.log('failed to fetch rocketchat user!');
    return false;
  }

  if (existingUser.length !== 0) {
    await updateChatUser(id, chatUser._id, email, chatUser.username);
    return true;
  }

  console.log(chatUser);

  await addChatUser(id, chatUser._id, email, chatUser.username);
  return true;
}

module.exports = {
  verifyUser,
  isAdmin,
  isFullTime,
  getUsers,
  getChatUsers,
  getChatUserByEmail,
  getUser,
  getUserRepositories,
  getUserCommitsByDate,
  getGroups,
  linkRocketChat,
};
