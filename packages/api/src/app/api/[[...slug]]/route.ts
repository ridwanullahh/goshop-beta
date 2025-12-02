import { Octokit } from 'octokit';
import { NextRequest, NextResponse } from 'next/server';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || 'ridwanullahh';
const repo = process.env.GITHUB_REPO || 'goshopdb';

async function getSHA(path: string) {
  try {
    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner,
        repo,
        path,
      }
    );
    if (Array.isArray(data)) {
      throw new Error('Path is a directory, not a file');
    }
    return (data as { sha: string }).sha;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const [collection, id] = params.slug;

  try {
    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner,
        repo,
        path: `db/${collection}.json`,
      }
    );

    if (Array.isArray(data)) {
        return NextResponse.json({ error: 'Path is a directory' }, { status: 400 });
    }

    const content = Buffer.from((data as { content: string }).content, 'base64').toString('utf-8');
    const items = JSON.parse(content);

    if (id) {
      const item = items.find((item: any) => item.id === id);
      if (item) {
        return NextResponse.json(item);
      } else {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    return NextResponse.json(items);
  } catch (error: any) {
    if (error.status === 404) {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const [collection] = params.slug;
  const body = await req.json();

  try {
    const sha = await getSHA(`db/${collection}.json`);
    let items = [];

    if (sha) {
      const { data } = await octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          owner,
          repo,
          path: `db/${collection}.json`,
        }
      );
      if (!Array.isArray(data)) {
        const content = Buffer.from((data as { content: string }).content, 'base64').toString('utf-8');
        items = JSON.parse(content);
      }
    }

    items.push(body);

    const content = Buffer.from(JSON.stringify(items, null, 2)).toString('base64');

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: `db/${collection}.json`,
      message: `Create ${collection}`,
      content,
      sha,
    });

    return NextResponse.json(body, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const [collection, id] = params.slug;
  const body = await req.json();

  try {
    const sha = await getSHA(`db/${collection}.json`);
    if (!sha) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner,
        repo,
        path: `db/${collection}.json`,
      }
    );
    if (Array.isArray(data)) {
        return NextResponse.json({ error: 'Path is a directory' }, { status: 400 });
    }
    const content = Buffer.from((data as { content: string }).content, 'base64').toString('utf-8');
    const items = JSON.parse(content);

    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    items[index] = { ...items[index], ...body };

    const newContent = Buffer.from(JSON.stringify(items, null, 2)).toString('base64');

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: `db/${collection}.json`,
      message: `Update ${collection}#${id}`,
      content: newContent,
      sha,
    });

    return NextResponse.json(items[index]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const [collection, id] = params.slug;

  try {
    const sha = await getSHA(`db/${collection}.json`);
    if (!sha) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner,
        repo,
        path: `db/${collection}.json`,
      }
    );
    if (Array.isArray(data)) {
        return NextResponse.json({ error: 'Path is a directory' }, { status: 400 });
    }
    const content = Buffer.from((data as { content: string }).content, 'base64').toString('utf-8');
    const items = JSON.parse(content);

    const newItems = items.filter((item: any) => item.id !== id);

    const newContent = Buffer.from(JSON.stringify(newItems, null, 2)).toString('base64');

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: `db/${collection}.json`,
      message: `Delete ${collection}#${id}`,
      content: newContent,
      sha,
    });

    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
