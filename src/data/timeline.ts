export interface ProductItem {
  name: string;
  badge: string;       // company or type label
  badgeColor: string;  // hex
  desc: string;
  url?: string;
}

export interface TimelineItem {
  year: string;
  conceptEN: string;
  conceptCN: string;
  oneLiner: string;
  explanation: string; // paragraphs separated by \n\n
  tags: string[];
  learnMoreUrl: string;
  color: string;
  products: ProductItem[];
}

export const timelineData: TimelineItem[] = [
  {
    year: "2017",
    conceptEN: "Transformer",
    conceptCN: "变换器架构",
    oneLiner: `让 AI 拥有了「一目十行」的阅读能力，这是后面所有突破的基础。`,
    explanation: `在 Transformer 出现之前，AI 读文字就像人一个字一个字往下念，读到后面就忘了前面说啥了。\n\nTransformer 的核心突破叫"注意力机制"——简单说就是让 AI 在读一段话的时候，能同时"看到"所有的字，自己判断哪些字跟哪些字关系更大。就像你看一篇文章，眼睛能在全文之间来回扫视，而不是只能从头到尾念一遍。`,
    tags: ["Transformer", "Attention", "Google", "NLP"],
    learnMoreUrl: "#",
    color: "#3b82f6",
    products: [
      {
        name: "BERT",
        badge: "Google",
        badgeColor: "#4285f4",
        desc: "第一个用 Transformer 做双向预训练的模型，让谷歌搜索读懂了你在问什么。",
      },
      {
        name: "GPT 系列",
        badge: "OpenAI",
        badgeColor: "#10a37f",
        desc: "把 Transformer 用于文本生成，从 GPT-1 到 GPT-4，直接催生了 ChatGPT 现象。",
      },
      {
        name: "Vision Transformer (ViT)",
        badge: "Google",
        badgeColor: "#4285f4",
        desc: "把 Transformer 搬进了图像识别，打破了 CNN 对视觉任务的垄断。",
      },
    ],
  },
  {
    year: "2018–2020",
    conceptEN: "Large Language Models",
    conceptCN: "大语言模型",
    oneLiner: `数据量和模型规模到达临界点后，AI 从「人工智障」进化成了「有点东西」。`,
    explanation: `早期的 AI 模型很小，训练数据也少，所以表现得很"蠢"——说话前言不搭后语，逻辑混乱，像个啥都不懂的小学生在胡扯。\n\n但研究者发现了一件事：当你把模型做得足够大、喂给它足够多的数据时，量变引发了质变。它突然就"开窍"了——能写文章、能做翻译、能回答问题，甚至能写代码。这就像一个人读了几本书和读了整个图书馆的区别，知识量到了一定程度，理解力就质变了。\n\nGPT-3 是第一个让大家意识到"大力出奇迹"的模型。`,
    tags: ["LLM", "GPT-3", "Scaling Law", "OpenAI"],
    learnMoreUrl: "#",
    color: "#06b6d4",
    products: [
      {
        name: "GPT-4o",
        badge: "OpenAI",
        badgeColor: "#10a37f",
        desc: "目前最广为人知的 LLM，多模态能力强，API 生态最成熟。",
      },
      {
        name: "Claude 3.7",
        badge: "Anthropic",
        badgeColor: "#d97706",
        desc: "以安全性、长上下文和代码能力著称，Sonnet 系列是开发者最爱。",
      },
      {
        name: "Gemini 2.0",
        badge: "Google",
        badgeColor: "#4285f4",
        desc: "深度整合 Google 生态，原生多模态，支持超长 200 万 token 上下文。",
      },
      {
        name: "DeepSeek R1",
        badge: "深度求索",
        badgeColor: "#8b5cf6",
        desc: "中国团队出品，训练成本极低但性能媲美顶级模型，震惊硅谷的黑马。",
      },
    ],
  },
  {
    year: "2022.11",
    conceptEN: "ChatGPT / Conversational AI",
    conceptCN: "对话式 AI",
    oneLiner: `给大模型上了一堂「社交礼仪课」，从能力强但难交流，变成了真正好用的对话伙伴。`,
    explanation: `大模型虽然能力强了，但它还是个"书呆子"——你问它问题，它的回答可能正确但很难用，甚至会一本正经地胡说八道。\n\nChatGPT 的关键在于，OpenAI 请了一堆真人来当"老师"，告诉 AI "这样回答好，那样回答不好"，一遍遍地纠正它。这个过程叫 RLHF（人类反馈强化学习），本质就是教 AI 说人话、懂分寸。\n\nChatGPT 一发布就爆了，因为普通人第一次发现：跟 AI 聊天，它居然真的能听懂你在说啥。`,
    tags: ["ChatGPT", "RLHF", "InstructGPT", "OpenAI"],
    learnMoreUrl: "#",
    color: "#8b5cf6",
    products: [
      {
        name: "ChatGPT",
        badge: "OpenAI",
        badgeColor: "#10a37f",
        desc: "5 天破百万用户，史上增长最快的消费级产品，定义了对话式 AI 的交互范式。",
      },
      {
        name: "Claude.ai",
        badge: "Anthropic",
        badgeColor: "#d97706",
        desc: `对话更自然，更擅长长文本分析，被开发者称为"最好聊"的 AI。`,
      },
      {
        name: "Kimi",
        badge: "月之暗面",
        badgeColor: "#06b6d4",
        desc: "国内最早主打超长上下文的对话 AI，一次可读完整本书或大型代码库。",
      },
      {
        name: "豆包",
        badge: "字节跳动",
        badgeColor: "#f43f5e",
        desc: "国内日活最高的 AI 对话产品，深度整合抖音生态，主打大众用户。",
      },
    ],
  },
  {
    year: "2023",
    conceptEN: "Prompt Engineering",
    conceptCN: "提示词工程",
    oneLiner: `体系化、规范化地跟 AI 对话的方法论——会提问的人，才能用好 AI。`,
    explanation: `大家用上 ChatGPT 之后发现一个有趣的现象：同样的 AI，你问的方式不同，回答质量天差地别。随便问一句"帮我写个方案"，AI 给你的东西很泛。\n\n但如果你说"你是一个10年经验的产品经理，请帮我写一个面向 B 端客户的 SaaS 产品方案，要求包含用户痛点分析、竞品对比、功能规划三个部分"——AI 的输出质量直接翻倍。\n\n提示词工程就是把这种"怎么跟 AI 说话效果最好"总结成了一套方法论。它不是编程，是一种沟通的艺术。`,
    tags: ["Prompt Engineering", "Few-shot", "CoT", "System Prompt"],
    learnMoreUrl: "#",
    color: "#3b82f6",
    products: [
      {
        name: "Custom Instructions",
        badge: "OpenAI",
        badgeColor: "#10a37f",
        desc: "ChatGPT 的个性化配置，告诉 AI 你是谁、你的偏好，让每次对话都更贴心。",
      },
      {
        name: "System Prompt 工程",
        badge: "企业级",
        badgeColor: "#6366f1",
        desc: "各大 AI 产品背后的隐藏配置——Cursor、Claude Code 的智能都来自精心设计的 system prompt。",
      },
      {
        name: "Prompt Flow",
        badge: "Microsoft",
        badgeColor: "#0078d4",
        desc: "Azure 上的提示词开发、测试和部署工具链，把 Prompt Engineering 流程化、工程化。",
      },
    ],
  },
  {
    year: "2023",
    conceptEN: "Retrieval-Augmented Generation",
    conceptCN: "检索增强生成",
    oneLiner: `让 AI 从「凭记忆答题」变成「开卷考试」，先查资料再回答，大大减少胡说八道。`,
    explanation: `AI 有个致命问题：它的知识是训练时固定的，过了这个时间点的事它就不知道了，而且有时候会"编造"不存在的信息（叫"幻觉"）。\n\nRAG 的思路特别朴素——既然 AI 自己知识有限，那就让它先去"查资料"再回答。就像一个员工接到问题后不是凭记忆瞎答，而是先翻公司文档库找到相关资料，再基于资料来回答。\n\n这样既保证了信息准确，又能回答训练数据之外的新问题。`,
    tags: ["RAG", "向量数据库", "Embeddings", "LangChain"],
    learnMoreUrl: "#",
    color: "#06b6d4",
    products: [
      {
        name: "Perplexity AI",
        badge: "Perplexity",
        badgeColor: "#20b2aa",
        desc: "实时联网搜索 + RAG 的 AI 搜索引擎，每条回答都带引用来源，告别一本正经胡说八道。",
      },
      {
        name: "企业知识问答",
        badge: "解决方案",
        badgeColor: "#6366f1",
        desc: "把公司文档、产品手册、FAQ 向量化入库，员工直接用自然语言查内部知识，HR/客服首选方案。",
      },
      {
        name: "Azure AI Search",
        badge: "Microsoft",
        badgeColor: "#0078d4",
        desc: "微软企业级 RAG 方案，一键接入 SharePoint、Office 文件，开箱即用。",
      },
      {
        name: "Dify",
        badge: "开源",
        badgeColor: "#8b5cf6",
        desc: "国产开源 LLM 应用开发平台，RAG 知识库 + 工作流 + API 一站搞定，GitHub 5万+ Star。",
      },
    ],
  },
  {
    year: "2023–2024",
    conceptEN: "AI Agent",
    conceptCN: "AI 智能体",
    oneLiner: `AI 从「你问我答」升级为「你说需求我来干」，具备了独立完成复杂任务的能力。`,
    explanation: `之前的 AI 都是"你问一句我答一句"的模式，就像一个只会回答问题的客服。但 Agent 不一样，它能自己拆解任务、制定计划、调用工具、一步步执行，遇到问题还能自己调整方案。\n\n你跟它说"帮我做一份竞品分析报告"，它会自己去搜索信息、整理数据、生成图表、排版成文档——而不是只给你一段文字。\n\n本质上：Agent = 大模型 + 规划能力 + 工具调用 + 记忆。它从一个"答题机器"变成了一个能干活的"实习生"。`,
    tags: ["AI Agent", "Tool Use", "Planning", "ReAct"],
    learnMoreUrl: "#",
    color: "#8b5cf6",
    products: [
      {
        name: "Cursor",
        badge: "Anysphere",
        badgeColor: "#3b82f6",
        desc: "AI 编程 Agent 标杆产品，能读懂整个代码库，自动改 bug、写功能、跑测试。",
      },
      {
        name: "Devin",
        badge: "Cognition",
        badgeColor: "#f59e0b",
        desc: `号称"第一个全自动软件工程师"，给它一个需求描述，它自己搭环境、写代码、部署上线。`,
      },
      {
        name: "Computer Use",
        badge: "Anthropic",
        badgeColor: "#d97706",
        desc: "Claude 能直接操控电脑屏幕——看图标、点按钮、填表单，像雇了个真人助理。",
      },
      {
        name: "AutoGen",
        badge: "Microsoft",
        badgeColor: "#0078d4",
        desc: "多 Agent 协作框架，让不同角色的 AI 互相对话、分工协作完成复杂任务。",
      },
    ],
  },
  {
    year: "2024",
    conceptEN: "Model Context Protocol",
    conceptCN: "模型上下文协议",
    oneLiner: `AI 世界的「USB 接口」——统一标准，让 AI 能即插即用地连接各种工具。`,
    explanation: `Agent 要干活就得用工具——查数据库、读文件、调 API、发邮件……但之前每接一个工具都要写一套专门的对接代码，特别麻烦。\n\nMCP 就是 Anthropic 提出的一套"通用插口标准"。你可以想象成 USB 接口：以前每个设备都有自己的充电线，现在统一用 Type-C，什么设备都能插。\n\nMCP 让 AI 能用标准化的方式连接各种外部工具和数据源，不用为每个工具单独开发，即插即用。`,
    tags: ["MCP", "Anthropic", "标准协议", "工具集成"],
    learnMoreUrl: "#",
    color: "#3b82f6",
    products: [
      {
        name: "Claude Desktop + MCP",
        badge: "Anthropic",
        badgeColor: "#d97706",
        desc: "官方旗舰场景：Claude 通过 MCP 直连本地文件、GitHub、数据库，成为真正的桌面助理。",
      },
      {
        name: "MCP Server 生态",
        badge: "社区开源",
        badgeColor: "#8b5cf6",
        desc: "短短几个月，社区已贡献数百个 MCP Server，覆盖 Notion、Slack、Figma、PostgreSQL 等主流工具。",
      },
      {
        name: "Cursor + MCP",
        badge: "Anysphere",
        badgeColor: "#3b82f6",
        desc: "IDE 里的 AI 通过 MCP 直连数据库 Schema 和文档，写代码时能实时查表结构、读 API 文档。",
      },
    ],
  },
  {
    year: "2025",
    conceptEN: "AI Skills",
    conceptCN: "AI 技能",
    oneLiner: `把「怎么做好一件事」打包成标准化的技能包，让 AI 从「啥都会一点」变成「件件都专业」。`,
    explanation: `如果说 MCP 解决了"AI 怎么连接工具"的问题，那 Skills 解决的是"AI 怎么把一件事做好"的问题。它跟提示词工程有点像，但更进一步——不只是告诉 AI 怎么理解你的话，而是把完成某个任务的最佳实践打包成一个"技能包"。\n\n比如一个"写 Word 文档"的 Skill，里面包含了排版规范、格式要求、常见错误的处理方式等等。AI 加载了这个技能包之后，就像一个新员工看了详细的 SOP，立刻知道该怎么高质量完成这件事。`,
    tags: ["AI Skills", "SOP", "最佳实践", "专业化"],
    learnMoreUrl: "#",
    color: "#06b6d4",
    products: [
      {
        name: "Claude Code Skills",
        badge: "Anthropic",
        badgeColor: "#d97706",
        desc: "本站正在使用的 AI 技能体系——把代码审查、提交规范、测试策略等打包成可复用的技能指令。",
      },
      {
        name: "Custom GPTs",
        badge: "OpenAI",
        badgeColor: "#10a37f",
        desc: `给 GPT 配置专属知识、工具和行为规则，打包成一个"专业化分身"，GPT Store 已上架数十万个。`,
      },
      {
        name: "Dify 工作流节点",
        badge: "开源",
        badgeColor: "#8b5cf6",
        desc: "把 AI 技能模块化，像搭积木一样组合成复杂流程，低代码实现企业级 AI 应用。",
      },
    ],
  },
  {
    year: "2025",
    conceptEN: "Vibe Coding",
    conceptCN: "氛围编程",
    oneLiner: `从「你写代码」变成「你说需求，AI 写代码」——编程门槛被拉到了接近零。`,
    explanation: `传统编程是你一行行写代码，需要记语法、懂框架、会调试。Vibe Coding 完全反过来——你只需要用大白话描述你想要什么，AI 帮你生成完整的代码。\n\n"帮我做一个深色主题的个人网站，左边导航栏，右边内容区"——说完这句话，一个网站就出来了。你不需要知道 React 怎么写、CSS 怎么调，你只要知道你想要什么效果就行。\n\n这就像你不需要会画建筑图纸，只需要告诉建筑师"我想要一个采光好的三室两厅"。`,
    tags: ["Vibe Coding", "AI 编程", "Claude Code", "No-code"],
    learnMoreUrl: "#",
    color: "#8b5cf6",
    products: [
      {
        name: "Cursor",
        badge: "Anysphere",
        badgeColor: "#3b82f6",
        desc: "Vibe Coding 最受欢迎的 IDE，Tab 补全 + Agent 模式 + 代码库理解，月活超百万开发者。",
      },
      {
        name: "v0.dev",
        badge: "Vercel",
        badgeColor: "#ffffff",
        desc: "用自然语言生成 React + Tailwind 组件，输出即可部署，设计师做原型利器。",
      },
      {
        name: "Bolt.new",
        badge: "StackBlitz",
        badgeColor: "#1976d2",
        desc: "浏览器内的全栈 Vibe Coding 环境，从零到全栈应用，全程无需本地环境。",
      },
      {
        name: "Claude Code",
        badge: "Anthropic",
        badgeColor: "#d97706",
        desc: "终端内的 AI 编程助手，能操作文件、跑命令、做代码审查，本站就是用它构建的。",
      },
    ],
  },
  {
    year: "2025",
    conceptEN: "Agentic Workflows",
    conceptCN: "智能工作流",
    oneLiner: `从单个 AI 助手进化到 AI 团队协作——复杂任务全自动化的终极形态。`,
    explanation: `上面这些能力攒到一起，就形成了终极形态：智能工作流。一个 Agent 不够用？那就让多个 Agent 协作。一个负责调研，一个负责写作，一个负责审核，一个负责排版——就像一个 AI 团队在流水线作业。\n\n你说一句"帮我生成本周的市场分析周报并发到团队群"，后面的搜索、分析、写作、排版、发送全自动完成。\n\n这不再是单点工具，而是一条完整的自动化生产线。`,
    tags: ["Multi-Agent", "工作流", "自动化", "LangGraph"],
    learnMoreUrl: "#",
    color: "#3b82f6",
    products: [
      {
        name: "LangGraph",
        badge: "LangChain",
        badgeColor: "#1c7d4d",
        desc: "构建有状态、可循环的多 Agent 工作流的主流框架，支持复杂的条件分支和人工介入。",
      },
      {
        name: "n8n + AI",
        badge: "n8n",
        badgeColor: "#ea4b71",
        desc: "把 AI 节点嵌入自动化工作流的开源工具，接 Gmail → 分析邮件 → 自动回复，配置即用。",
      },
      {
        name: "Coze",
        badge: "字节跳动",
        badgeColor: "#f43f5e",
        desc: "国产 Agent 开发平台，可视化搭建多 Agent 工作流，一键发布到微信、飞书、抖音等渠道。",
      },
    ],
  },
];
